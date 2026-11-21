import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import multer from 'multer';
import {
  db,
  mapProductRow,
  PRIVATE_FILES_DIR,
  PUBLIC_UPLOADS_DIR,
  type DbProductRow,
} from './db.ts';
import {
  claimFirstAdmin,
  getClaimedAdminRow,
  getEnvAdminPasscode,
  isAllowedOwnerEmail,
  isOwnerAutoAuthorized,
  signAdminToken,
  verifyAdminPassword,
  verifyAdminToken,
  verifyFirebaseIdToken,
  type VerifiedFirebaseUser,
} from './auth.ts';

interface AuthedRequest extends Request {
  firebaseUser?: VerifiedFirebaseUser;
}

function extractBearer(req: Request): string {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return '';
  return header.slice(7).trim();
}

async function requireFirebaseAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const token = extractBearer(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  const verified = await verifyFirebaseIdToken(token);
  if (!verified) {
    res.status(401).json({ error: 'Invalid or expired Firebase session.' });
    return;
  }
  req.firebaseUser = verified;
  next();
}

function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const user = req.firebaseUser;
  if (!user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  if (!isAllowedOwnerEmail(user.email)) {
    res.status(403).json({ error: 'Admin access is restricted to the store owner only.' });
    return;
  }
  if (isOwnerAutoAuthorized(user)) {
    next();
    return;
  }
  const adminToken = String(req.headers['x-admin-token'] || '');
  if (adminToken && verifyAdminToken(adminToken, user.uid)) {
    next();
    return;
  }
  res.status(403).json({ error: 'Admin authorization required.' });
}

function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function safeResolveWithin(baseDir: string, fileName: string): string | null {
  const cleanName = path.basename(fileName);
  const resolved = path.resolve(baseDir, cleanName);
  if (!resolved.startsWith(baseDir + path.sep)) {
    return null;
  }
  return resolved;
}

const deliverableUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, PRIVATE_FILES_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const id = crypto.randomUUID();
      cb(null, `${id}${ext}`);
    },
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = new Set(['.pdf', '.xlsx', '.xls', '.csv', '.md', '.txt', '.zip']);
    if (!allowed.has(ext)) {
      cb(new Error('Unsupported deliverable file type. Upload PDF, XLSX, CSV, MD, TXT, or ZIP.'));
      return;
    }
    cb(null, true);
  },
});

const previewUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, PUBLIC_UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const id = crypto.randomUUID();
      cb(null, `preview-${id}${ext}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = new Set(['.jpg', '.jpeg', '.png', '.webp']);
    if (!allowed.has(ext)) {
      cb(new Error('Unsupported preview image type. Upload JPG, PNG, or WEBP.'));
      return;
    }
    cb(null, true);
  },
});

export const app = express();
app.use(express.json({ limit: '2mb' }));

// Public uploaded preview images with strict path confinement
app.get('/uploads/:filename', (req, res) => {
  const resolved = safeResolveWithin(PUBLIC_UPLOADS_DIR, String(req.params.filename));
  if (!resolved || !fs.existsSync(resolved)) {
    res.status(404).send('Not found');
    return;
  }
  res.sendFile(resolved);
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mode: 'demo-payment-backend-enabled' });
});

// Public catalog & editorial articles
app.get('/api/catalog', (_req, res) => {
  const prodRows = db
    .prepare('SELECT * FROM products ORDER BY featured DESC, created_at DESC')
    .all() as unknown as DbProductRow[];

  const blogRows = db
    .prepare('SELECT * FROM blog_articles ORDER BY rowid DESC')
    .all() as unknown as {
      id: string;
      slug: string;
      category: string;
      title: string;
      excerpt: string;
      published_at: string;
      read_time: string;
      image: string;
      image_alt: string;
      body_json: string;
    }[];

  res.json({
    products: prodRows.map(mapProductRow),
    blogArticles: blogRows.map((b) => ({
      id: b.id,
      slug: b.slug,
      category: b.category,
      title: b.title,
      excerpt: b.excerpt,
      publishedAt: b.published_at,
      readTime: b.read_time,
      image: b.image,
      imageAlt: b.image_alt,
      body: JSON.parse(b.body_json) as string[],
    })),
  });
});

// Newsletter & Free Resource lead capture
app.post('/api/subscribers', (req, res) => {
  const { firstName, email, consentGiven, source, resourceName } = req.body as {
    firstName?: string;
    email?: string;
    consentGiven?: boolean;
    source?: string;
    resourceName?: string;
  };

  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    res.status(400).json({ error: 'Valid email address is required.' });
    return;
  }
  if (!consentGiven) {
    res.status(400).json({ error: 'Explicit email consent is required.' });
    return;
  }

  const cleanSource = source === 'free-resource' ? 'free-resource' : 'newsletter';
  const id = `sub-${crypto.randomUUID().slice(0, 8)}`;
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO subscribers (id, first_name, email, consent_given, source, resource_name, created_at)
    VALUES (?, ?, ?, 1, ?, ?, ?)
  `).run(
    id,
    firstName ? String(firstName).trim().slice(0, 80) : null,
    cleanEmail,
    cleanSource,
    resourceName ? String(resourceName).trim().slice(0, 120) : null,
    createdAt
  );

  res.status(201).json({ ok: true, id });
});

// About page contact message persistence
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body as {
    name?: string;
    email?: string;
    message?: string;
  };
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanMsg = String(message || '').trim();
  const cleanName = String(name || '').trim();

  if (!cleanName || !cleanEmail.includes('@') || !cleanMsg) {
    res.status(400).json({ error: 'Name, valid email, and message are required.' });
    return;
  }

  const id = `msg-${crypto.randomUUID().slice(0, 8)}`;
  db.prepare(`
    INSERT INTO contact_messages (id, name, email, message, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, cleanName.slice(0, 120), cleanEmail, cleanMsg.slice(0, 2000), new Date().toISOString());

  res.status(201).json({ ok: true, id });
});

// Validate discount code server-side
app.post('/api/discounts/validate', (req, res) => {
  const code = String((req.body as { code?: string }).code || '')
    .trim()
    .toUpperCase();
  if (!code) {
    res.status(400).json({ valid: false, error: 'Enter a discount code.' });
    return;
  }

  const row = db
    .prepare('SELECT code, percent_off, active, description FROM discount_codes WHERE code = ?')
    .get(code) as
    | { code: string; percent_off: number; active: number; description: string }
    | undefined;

  if (!row || row.active !== 1) {
    res.json({ valid: false, error: 'Invalid or inactive discount code.' });
    return;
  }

  res.json({
    valid: true,
    code: row.code,
    percentOff: Number(row.percent_off),
    description: row.description,
  });
});

// Demo Checkout Order Creation (No real payment processor, authoritative backend pricing)
app.post('/api/orders', async (req, res) => {
  const {
    customerEmail,
    items,
    discountCode,
    paymentMethod,
    paymentProviderName,
  } = req.body as {
    customerEmail?: string;
    items?: { productId: string; qty: number }[];
    discountCode?: string;
    paymentMethod?: string;
    paymentProviderName?: string;
  };

  const cleanEmail = String(customerEmail || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    res.status(400).json({ error: 'Valid customer email is required.' });
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Cart cannot be empty.' });
    return;
  }

  // Optional verified Firebase user association
  let userId: string | null = null;
  const bearer = extractBearer(req);
  if (bearer) {
    const verified = await verifyFirebaseIdToken(bearer);
    if (verified) userId = verified.uid;
  }

  const orderItems: {
    productId: string;
    title: string;
    productType: string;
    unitPrice: number;
    qty: number;
  }[] = [];
  let subtotal = 0;

  for (const entry of items) {
    const qty = Math.max(1, Math.min(20, Math.floor(Number(entry.qty) || 1)));
    const prod = db
      .prepare('SELECT id, title, product_type, price FROM products WHERE id = ?')
      .get(String(entry.productId || '')) as
      | { id: string; title: string; product_type: string; price: number }
      | undefined;
    if (!prod) {
      res.status(400).json({ error: 'One or more products are no longer available.' });
      return;
    }
    const unitPrice = Number(prod.price);
    subtotal += unitPrice * qty;
    orderItems.push({
      productId: prod.id,
      title: prod.title,
      productType: prod.product_type,
      unitPrice,
      qty,
    });
  }

  subtotal = Number(subtotal.toFixed(2));
  let appliedCode: string | null = null;
  let discountAmount = 0;

  if (discountCode) {
    const normalized = String(discountCode).trim().toUpperCase();
    const coupon = db
      .prepare('SELECT code, percent_off, active FROM discount_codes WHERE code = ?')
      .get(normalized) as
      | { code: string; percent_off: number; active: number }
      | undefined;
    if (coupon && coupon.active === 1) {
      appliedCode = coupon.code;
      discountAmount = Number(((subtotal * Number(coupon.percent_off)) / 100).toFixed(2));
    }
  }

  const total = Math.max(0, Number((subtotal - discountAmount).toFixed(2)));
  const orderId = `DEMO-CL-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const receiptToken = crypto.randomBytes(24).toString('hex');
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO orders (
      id, created_at, customer_email, user_id, items_json, subtotal,
      discount_code, discount_amount, total, currency, payment_method,
      payment_provider_name, status, download_count, receipt_token
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'USD', ?, ?, 'Demo Confirmed', 0, ?)
  `).run(
    orderId,
    createdAt,
    cleanEmail,
    userId,
    JSON.stringify(orderItems),
    subtotal,
    appliedCode,
    discountAmount,
    total,
    String(paymentMethod || 'demo-card'),
    String(paymentProviderName || 'Demo Test Checkout'),
    receiptToken
  );

  res.status(201).json({
    order: {
      id: orderId,
      createdAt,
      customerEmail: cleanEmail,
      userId: userId ?? undefined,
      items: orderItems,
      subtotal,
      discountCode: appliedCode ?? undefined,
      discountAmount,
      total,
      currency: 'USD',
      paymentMethod: String(paymentMethod || 'demo-card'),
      paymentProviderName: String(paymentProviderName || 'Demo Test Checkout'),
      status: 'Demo Confirmed',
      downloadCount: 0,
      receiptToken,
    },
  });
});

// Signed-in customer order history (ownership verified)
app.get('/api/orders/my', requireFirebaseAuth, (req: AuthedRequest, res) => {
  const user = req.firebaseUser!;
  const rows = db
    .prepare(
      'SELECT * FROM orders WHERE user_id = ? OR LOWER(customer_email) = ? ORDER BY created_at DESC'
    )
    .all(user.uid, user.email.toLowerCase()) as unknown as {
      id: string;
      created_at: string;
      customer_email: string;
      user_id: string | null;
      items_json: string;
      subtotal: number;
      discount_code: string | null;
      discount_amount: number;
      total: number;
      currency: string;
      payment_method: string;
      payment_provider_name: string;
      status: string;
      download_count: number;
      last_downloaded_at: string | null;
      receipt_token: string;
    }[];

  res.json({
    orders: rows.map((o) => ({
      id: o.id,
      createdAt: o.created_at,
      customerEmail: o.customer_email,
      userId: o.user_id ?? undefined,
      items: JSON.parse(o.items_json),
      subtotal: Number(o.subtotal),
      discountCode: o.discount_code ?? undefined,
      discountAmount: Number(o.discount_amount),
      total: Number(o.total),
      currency: o.currency,
      paymentMethod: o.payment_method,
      paymentProviderName: o.payment_provider_name,
      status: o.status,
      downloadCount: Number(o.download_count),
      lastDownloadedAt: o.last_downloaded_at ?? undefined,
      receiptToken: o.receipt_token,
    })),
  });
});

// Gated digital file delivery (serves real uploaded PDF/file or structured starter bundle)
app.get('/api/downloads/:orderId/:productId', async (req, res) => {
  const orderId = String(req.params.orderId);
  const productId = String(req.params.productId);
  const receipt = String(req.query.receipt || '');
  const bearer = extractBearer(req);

  const order = db
    .prepare('SELECT * FROM orders WHERE id = ?')
    .get(orderId) as
    | {
        id: string;
        customer_email: string;
        user_id: string | null;
        items_json: string;
        receipt_token: string;
      }
    | undefined;

  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  let authorized = false;
  if (receipt && receipt === order.receipt_token) {
    authorized = true;
  } else if (bearer) {
    const verified = await verifyFirebaseIdToken(bearer);
    if (
      verified &&
      (order.user_id === verified.uid ||
        order.customer_email.toLowerCase() === verified.email.toLowerCase())
    ) {
      authorized = true;
    }
  }

  if (!authorized) {
    res.status(403).json({ error: 'Unauthorized download access.' });
    return;
  }

  const items = JSON.parse(order.items_json) as { productId: string }[];
  if (!items.some((i) => i.productId === productId)) {
    res.status(403).json({ error: 'Product not included in this order.' });
    return;
  }

  const prod = db
    .prepare('SELECT * FROM products WHERE id = ?')
    .get(productId) as unknown as DbProductRow | undefined;

  if (!prod) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  db.prepare(
    'UPDATE orders SET download_count = download_count + 1, last_downloaded_at = ? WHERE id = ?'
  ).run(new Date().toISOString(), orderId);

  if (prod.deliverable_file_key) {
    const resolved = safeResolveWithin(PRIVATE_FILES_DIR, prod.deliverable_file_key);
    if (resolved && fs.existsSync(resolved)) {
      const downloadName = prod.deliverable_file_name || `${prod.slug}.pdf`;
      res.download(resolved, downloadName);
      return;
    }
  }

  // Fallback generated starter markdown when no PDF/file has been uploaded yet by Admin
  const mapped = mapProductRow(prod);
  const content = [
    `# ${mapped.title} — CraftedLabs Digital Starter Package`,
    `Order Reference: ${order.id}`,
    `Licensed To: ${order.customer_email}`,
    `Product Type: ${mapped.productType}`,
    `Delivered: ${new Date().toISOString()}`,
    '',
    '## Overview',
    mapped.subtitle,
    '',
    mapped.fullDesc,
    '',
    '## Included Modules',
    ...mapped.whatsIncluded.map((w, idx) => `${idx + 1}. ${w}`),
    '',
    '## Setup Summary',
    mapped.deliverableSummary,
  ].join('\n');

  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${mapped.slug}-craftedlabs-package.md"`
  );
  res.send(content);
});

// ========================
// ADMIN AUTHENTICATION API
// ========================
app.get('/api/admin/status', requireFirebaseAuth, (req: AuthedRequest, res) => {
  const user = req.firebaseUser!;
  const isOwner = isAllowedOwnerEmail(user.email);
  const envPassConfigured = getEnvAdminPasscode().length > 0;
  const claimed = getClaimedAdminRow();
  const hasClaimedAdmin = Boolean(claimed?.password_hash);

  if (!isOwner) {
    res.json({
      isAuthorized: false,
      ownerOnlyDenied: true,
      envPassConfigured,
      hasClaimedAdmin,
      requiresSetup: false,
    });
    return;
  }

  const adminHeader = String(req.headers['x-admin-token'] || '');
  const autoAuthorized = isOwnerAutoAuthorized(user);
  const isAuthorized =
    autoAuthorized ||
    (adminHeader.length > 0 && verifyAdminToken(adminHeader, user.uid));

  res.json({
    isAuthorized,
    ownerOnlyDenied: false,
    envPassConfigured,
    hasClaimedAdmin,
    requiresSetup: !envPassConfigured && !hasClaimedAdmin && !autoAuthorized,
    claimedEmail: claimed?.claimed_email ?? undefined,
  });
});

app.post('/api/admin/claim', requireFirebaseAuth, (req: AuthedRequest, res) => {
  const user = req.firebaseUser!;
  if (!isAllowedOwnerEmail(user.email)) {
    res.status(403).json({ error: 'Admin access is restricted to the store owner only.' });
    return;
  }
  const { password } = req.body as { password?: string };

  if (getEnvAdminPasscode().length > 0) {
    res.status(400).json({ error: 'Admin passcode is configured via environment variables.' });
    return;
  }

  const cleanPass = String(password || '');
  if (cleanPass.length < 8) {
    res.status(400).json({ error: 'Choose an admin password of at least 8 characters.' });
    return;
  }

  const ok = claimFirstAdmin(user.uid, user.email, cleanPass);
  if (!ok) {
    res.status(409).json({ error: 'Admin access has already been claimed. Sign in with your admin password.' });
    return;
  }

  const adminToken = signAdminToken(user.uid, user.email);
  res.json({ adminToken });
});

app.post('/api/admin/unlock', requireFirebaseAuth, (req: AuthedRequest, res) => {
  const user = req.firebaseUser!;
  if (!isAllowedOwnerEmail(user.email)) {
    res.status(403).json({ error: 'Admin access is restricted to the store owner only.' });
    return;
  }

  if (isOwnerAutoAuthorized(user)) {
    const adminToken = signAdminToken(user.uid, user.email);
    res.json({ adminToken });
    return;
  }

  const { password } = req.body as { password?: string };
  if (!password || !verifyAdminPassword(String(password))) {
    res.status(403).json({ error: 'Invalid admin password.' });
    return;
  }

  const adminToken = signAdminToken(user.uid, user.email);
  res.json({ adminToken });
});

// ========================
// PROTECTED ADMIN APIs
// ========================
app.get('/api/admin/overview', requireFirebaseAuth, requireAdmin, (_req, res) => {
  const prodCount = (db.prepare('SELECT COUNT(*) AS c FROM products').get() as { c: number }).c;
  const uploadedCount = (
    db
      .prepare('SELECT COUNT(*) AS c FROM products WHERE deliverable_file_key IS NOT NULL')
      .get() as { c: number }
  ).c;
  const orderStats = db
    .prepare('SELECT COUNT(*) AS c, COALESCE(SUM(total), 0) AS rev FROM orders')
    .get() as { c: number; rev: number };
  const subCount = (db.prepare('SELECT COUNT(*) AS c FROM subscribers').get() as { c: number }).c;
  const msgCount = (db.prepare('SELECT COUNT(*) AS c FROM contact_messages').get() as { c: number }).c;

  res.json({
    productCount: prodCount,
    uploadedFileCount: uploadedCount,
    orderCount: orderStats.c,
    totalRevenue: Number(orderStats.rev),
    subscriberCount: subCount,
    messageCount: msgCount,
  });
});

app.get('/api/admin/products', requireFirebaseAuth, requireAdmin, (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM products ORDER BY featured DESC, created_at DESC')
    .all() as unknown as DbProductRow[];
  res.json({ products: rows.map(mapProductRow) });
});

app.post('/api/admin/products', requireFirebaseAuth, requireAdmin, (req, res) => {
  const body = req.body as {
    title?: string;
    subtitle?: string;
    category?: string;
    productType?: string;
    shortDesc?: string;
    fullDesc?: string;
    price?: number;
    compareAtPrice?: number;
    priceNote?: string;
    isDemoProduct?: boolean;
    featured?: boolean;
    cardBg?: string;
    image?: string;
    whatsIncluded?: string[];
    fileFormats?: string[];
    compatibility?: string[];
  };

  const title = String(body.title || '').trim();
  if (!title) {
    res.status(400).json({ error: 'Product title is required.' });
    return;
  }

  const id = `prod-${crypto.randomUUID().slice(0, 8)}`;
  const baseSlug = sanitizeSlug(title) || id;
  const existingSlug = db.prepare('SELECT id FROM products WHERE slug = ?').get(baseSlug);
  const slug = existingSlug ? `${baseSlug}-${id.slice(-4)}` : baseSlug;
  const image =
    String(body.image || '').trim() || '/assets/images/solobiz_os_showcase_1795209164172.jpg';

  const shortDesc =
    String(body.shortDesc || '').trim() || 'Practical digital tool crafted by CraftedLabs.';
  const fullDesc = String(body.fullDesc || '').trim() || shortDesc;

  db.prepare(`
    INSERT INTO products (
      id, slug, title, subtitle, category, product_type, short_desc, full_desc,
      price, compare_at_price, price_note, is_demo_product, featured, created_at,
      card_bg, image, image_alt, gallery_json, whats_included_json, who_it_is_for_json,
      benefits_json, file_formats_json, compatibility_json, faqs_json, deliverable_summary
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    slug,
    title,
    String(body.subtitle || shortDesc).trim(),
    String(body.category || 'business-entrepreneurship'),
    String(body.productType || 'Digital PDF & Template'),
    shortDesc,
    fullDesc,
    Math.max(0, Number(body.price) || 0),
    body.compareAtPrice ? Number(body.compareAtPrice) : null,
    body.priceNote ? String(body.priceNote) : null,
    body.isDemoProduct === false ? 0 : 1,
    body.featured ? 1 : 0,
    new Date().toISOString().slice(0, 10),
    String(body.cardBg || '#FFFDF7'),
    image,
    title,
    JSON.stringify([{ src: image, alt: title, caption: title }]),
    JSON.stringify(
      Array.isArray(body.whatsIncluded) && body.whatsIncluded.length > 0
        ? body.whatsIncluded
        : ['Digital deliverable file', 'Setup documentation']
    ),
    JSON.stringify(['Independent professionals and creators']),
    JSON.stringify(['Ready for immediate download and everyday workflows']),
    JSON.stringify(
      Array.isArray(body.fileFormats) && body.fileFormats.length > 0
        ? body.fileFormats
        : ['PDF']
    ),
    JSON.stringify(
      Array.isArray(body.compatibility) && body.compatibility.length > 0
        ? body.compatibility
        : ['Any modern PDF reader / spreadsheet editor']
    ),
    JSON.stringify([
      {
        q: 'How is this delivered?',
        a: 'Available immediately after completing Demo Checkout.',
      },
    ]),
    'Download your verified package from the confirmation view or Customer Account.'
  );

  const created = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as unknown as DbProductRow;
  res.status(201).json({ product: mapProductRow(created) });
});

app.put('/api/admin/products/:id', requireFirebaseAuth, requireAdmin, (req, res) => {
  const id = String(req.params.id);
  const existing = db
    .prepare('SELECT * FROM products WHERE id = ?')
    .get(id) as unknown as DbProductRow | undefined;

  if (!existing) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  const body = req.body as Partial<{
    title: string;
    subtitle: string;
    category: string;
    productType: string;
    shortDesc: string;
    fullDesc: string;
    price: number;
    featured: boolean;
    isDemoProduct: boolean;
    image: string;
  }>;

  db.prepare(`
    UPDATE products
    SET title = ?, subtitle = ?, category = ?, product_type = ?,
        short_desc = ?, full_desc = ?, price = ?, featured = ?,
        is_demo_product = ?, image = ?
    WHERE id = ?
  `).run(
    body.title !== undefined ? String(body.title).trim() : existing.title,
    body.subtitle !== undefined ? String(body.subtitle).trim() : existing.subtitle,
    body.category !== undefined ? String(body.category) : existing.category,
    body.productType !== undefined ? String(body.productType).trim() : existing.product_type,
    body.shortDesc !== undefined ? String(body.shortDesc).trim() : existing.short_desc,
    body.fullDesc !== undefined ? String(body.fullDesc).trim() : existing.full_desc,
    body.price !== undefined ? Math.max(0, Number(body.price)) : existing.price,
    body.featured !== undefined ? (body.featured ? 1 : 0) : existing.featured,
    body.isDemoProduct !== undefined
      ? body.isDemoProduct
        ? 1
        : 0
      : existing.is_demo_product,
    body.image !== undefined ? String(body.image).trim() : existing.image,
    id
  );

  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as unknown as DbProductRow;
  res.json({ product: mapProductRow(updated) });
});

app.delete('/api/admin/products/:id', requireFirebaseAuth, requireAdmin, (req, res) => {
  const id = String(req.params.id);
  const existing = db
    .prepare('SELECT deliverable_file_key FROM products WHERE id = ?')
    .get(id) as { deliverable_file_key: string | null } | undefined;

  if (existing?.deliverable_file_key) {
    const filePath = safeResolveWithin(PRIVATE_FILES_DIR, existing.deliverable_file_key);
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  res.json({ ok: true });
});

// Upload PDF / Digital Deliverable File for a Product
app.post(
  '/api/admin/products/:id/deliverable',
  requireFirebaseAuth,
  requireAdmin,
  deliverableUpload.single('file'),
  (req, res) => {
    const id = String(req.params.id);
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'Please select a PDF or digital file to upload.' });
      return;
    }

    const existing = db
      .prepare('SELECT id, deliverable_file_key FROM products WHERE id = ?')
      .get(id) as { id: string; deliverable_file_key: string | null } | undefined;

    if (!existing) {
      fs.unlinkSync(file.path);
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    if (existing.deliverable_file_key) {
      const oldPath = safeResolveWithin(PRIVATE_FILES_DIR, existing.deliverable_file_key);
      if (oldPath && fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const safeOriginal = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');

    db.prepare(`
      UPDATE products
      SET deliverable_file_key = ?,
          deliverable_file_name = ?,
          deliverable_file_size = ?,
          deliverable_mime_type = ?
      WHERE id = ?
    `).run(file.filename, safeOriginal, file.size, file.mimetype, id);

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as unknown as DbProductRow;
    res.json({ product: mapProductRow(updated) });
  }
);

// Upload Product Preview Image
app.post(
  '/api/admin/upload/preview',
  requireFirebaseAuth,
  requireAdmin,
  previewUpload.single('image'),
  (req, res) => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'Please select a JPG, PNG, or WEBP image.' });
      return;
    }
    res.json({ url: `/uploads/${file.filename}` });
  }
);

app.get('/api/admin/orders', requireFirebaseAuth, requireAdmin, (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM orders ORDER BY created_at DESC')
    .all() as unknown as {
      id: string;
      created_at: string;
      customer_email: string;
      user_id: string | null;
      items_json: string;
      subtotal: number;
      discount_code: string | null;
      discount_amount: number;
      total: number;
      currency: string;
      payment_method: string;
      payment_provider_name: string;
      status: string;
      download_count: number;
      last_downloaded_at: string | null;
    }[];

  res.json({
    orders: rows.map((o) => ({
      id: o.id,
      createdAt: o.created_at,
      customerEmail: o.customer_email,
      userId: o.user_id ?? undefined,
      items: JSON.parse(o.items_json),
      subtotal: Number(o.subtotal),
      discountCode: o.discount_code ?? undefined,
      discountAmount: Number(o.discount_amount),
      total: Number(o.total),
      currency: o.currency,
      paymentMethod: o.payment_method,
      paymentProviderName: o.payment_provider_name,
      status: o.status,
      downloadCount: Number(o.download_count),
      lastDownloadedAt: o.last_downloaded_at ?? undefined,
    })),
  });
});

app.get('/api/admin/subscribers', requireFirebaseAuth, requireAdmin, (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM subscribers ORDER BY created_at DESC')
    .all() as unknown as {
      id: string;
      first_name: string | null;
      email: string;
      consent_given: number;
      source: string;
      resource_name: string | null;
      created_at: string;
    }[];

  res.json({
    subscribers: rows.map((s) => ({
      id: s.id,
      firstName: s.first_name ?? undefined,
      email: s.email,
      consentGiven: s.consent_given === 1,
      source: s.source,
      resourceName: s.resource_name ?? undefined,
      createdAt: s.created_at,
    })),
  });
});

app.get('/api/admin/messages', requireFirebaseAuth, requireAdmin, (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM contact_messages ORDER BY created_at DESC')
    .all();
  res.json({ messages: rows });
});

app.post('/api/admin/blog', requireFirebaseAuth, requireAdmin, (req, res) => {
  const { title, category, excerpt, body } = req.body as {
    title?: string;
    category?: string;
    excerpt?: string;
    body?: string[];
  };
  const cleanTitle = String(title || '').trim();
  if (!cleanTitle) {
    res.status(400).json({ error: 'Article title is required.' });
    return;
  }

  const id = `blog-${crypto.randomUUID().slice(0, 8)}`;
  const slug = sanitizeSlug(cleanTitle) || id;
  const cleanExcerpt = String(excerpt || '').trim() || 'Editorial note from CraftedLabs.';
  const paragraphs =
    Array.isArray(body) && body.length > 0 ? body : [cleanExcerpt];
  const publishedAt = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });

  db.prepare(`
    INSERT INTO blog_articles (
      id, slug, category, title, excerpt, published_at, read_time, image, image_alt, body_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    slug,
    String(category || 'Small Business').trim(),
    cleanTitle,
    cleanExcerpt,
    publishedAt,
    '3 min read',
    '/assets/images/craftedlabs_studio_story_1795209165556.jpg',
    cleanTitle,
    JSON.stringify(paragraphs)
  );

  res.status(201).json({
    article: {
      id,
      slug,
      category: String(category || 'Small Business').trim(),
      title: cleanTitle,
      excerpt: cleanExcerpt,
      publishedAt,
      readTime: '3 min read',
      image: '/assets/images/craftedlabs_studio_story_1795209165556.jpg',
      imageAlt: cleanTitle,
      body: paragraphs,
    },
  });
});

app.delete('/api/admin/blog/:id', requireFirebaseAuth, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM blog_articles WHERE id = ?').run(String(req.params.id));
  res.json({ ok: true });
});

app.get('/api/admin/discounts', requireFirebaseAuth, requireAdmin, (_req, res) => {
  const rows = db
    .prepare('SELECT code, percent_off, active, description FROM discount_codes')
    .all() as unknown as {
      code: string;
      percent_off: number;
      active: number;
      description: string;
    }[];
  res.json({
    discountCodes: rows.map((d) => ({
      code: d.code,
      percentOff: Number(d.percent_off),
      active: d.active === 1,
      description: d.description,
    })),
  });
});

app.post('/api/admin/discounts', requireFirebaseAuth, requireAdmin, (req, res) => {
  const { code, percentOff, description } = req.body as {
    code?: string;
    percentOff?: number;
    description?: string;
  };
  const normalized = String(code || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '');
  if (!normalized) {
    res.status(400).json({ error: 'Valid discount code is required.' });
    return;
  }
  const pct = Math.min(90, Math.max(1, Math.round(Number(percentOff) || 10)));
  const desc = String(description || `${pct}% store discount`).trim();

  db.prepare(`
    INSERT INTO discount_codes (code, percent_off, active, description)
    VALUES (?, ?, 1, ?)
    ON CONFLICT(code) DO UPDATE SET
      percent_off = excluded.percent_off,
      active = 1,
      description = excluded.description
  `).run(normalized, pct, desc);

  res.status(201).json({
    discountCode: { code: normalized, percentOff: pct, active: true, description: desc },
  });
});

app.patch(
  '/api/admin/discounts/:code/toggle',
  requireFirebaseAuth,
  requireAdmin,
  (req, res) => {
    const normalized = String(req.params.code || '').toUpperCase();
    const row = db
      .prepare('SELECT active FROM discount_codes WHERE code = ?')
      .get(normalized) as { active: number } | undefined;
    if (!row) {
      res.status(404).json({ error: 'Discount code not found.' });
      return;
    }
    const nextActive = row.active === 1 ? 0 : 1;
    db.prepare('UPDATE discount_codes SET active = ? WHERE code = ?').run(
      nextActive,
      normalized
    );
    res.json({ code: normalized, active: nextActive === 1 });
  }
);

// Error handler for multer & upload errors
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const msg = err instanceof Error ? err.message : 'Server request error.';
  res.status(400).json({ error: msg });
});


export default app;
