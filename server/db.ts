import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  SEED_BLOG_ARTICLES,
  SEED_DISCOUNT_CODES,
  SEED_PRODUCTS,
} from './seedData.ts';

function resolveBaseRuntimeDir(): string {
  if (
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NOW_REGION
  ) {
    return path.join(os.tmpdir(), 'craftedlabs');
  }
  try {
    fs.accessSync(process.cwd(), fs.constants.W_OK);
    return process.cwd();
  } catch {
    return path.join(os.tmpdir(), 'craftedlabs');
  }
}

const BASE_RUNTIME_DIR = resolveBaseRuntimeDir();

export const DATA_DIR = path.resolve(BASE_RUNTIME_DIR, 'data');
export const STORAGE_DIR = path.resolve(BASE_RUNTIME_DIR, 'storage');
export const PRIVATE_FILES_DIR = path.resolve(STORAGE_DIR, 'private_files');
export const PUBLIC_UPLOADS_DIR = path.resolve(STORAGE_DIR, 'public_uploads');

for (const dir of [DATA_DIR, STORAGE_DIR, PRIVATE_FILES_DIR, PUBLIC_UPLOADS_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

export const db = new DatabaseSync(path.join(DATA_DIR, 'craftedlabs.db'));
try {
  db.exec('PRAGMA journal_mode = WAL;');
} catch {
  // Some serverless /tmp filesystems prefer default journal mode
}
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    category TEXT NOT NULL,
    product_type TEXT NOT NULL,
    short_desc TEXT NOT NULL,
    full_desc TEXT NOT NULL,
    price REAL NOT NULL,
    compare_at_price REAL,
    price_note TEXT,
    is_demo_product INTEGER NOT NULL DEFAULT 1,
    featured INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    card_bg TEXT NOT NULL DEFAULT '#FFFDF7',
    image TEXT NOT NULL,
    image_alt TEXT NOT NULL,
    gallery_json TEXT NOT NULL,
    whats_included_json TEXT NOT NULL,
    who_it_is_for_json TEXT NOT NULL,
    benefits_json TEXT NOT NULL,
    file_formats_json TEXT NOT NULL,
    compatibility_json TEXT NOT NULL,
    faqs_json TEXT NOT NULL,
    deliverable_summary TEXT NOT NULL,
    deliverable_file_key TEXT,
    deliverable_file_name TEXT,
    deliverable_file_size INTEGER,
    deliverable_mime_type TEXT
  );

  CREATE TABLE IF NOT EXISTS blog_articles (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    published_at TEXT NOT NULL,
    read_time TEXT NOT NULL,
    image TEXT NOT NULL,
    image_alt TEXT NOT NULL,
    body_json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS discount_codes (
    code TEXT PRIMARY KEY,
    percent_off REAL NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    description TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    user_id TEXT,
    items_json TEXT NOT NULL,
    subtotal REAL NOT NULL,
    discount_code TEXT,
    discount_amount REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    payment_method TEXT NOT NULL,
    payment_provider_name TEXT NOT NULL,
    status TEXT NOT NULL,
    download_count INTEGER NOT NULL DEFAULT 0,
    last_downloaded_at TEXT,
    receipt_token TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    id TEXT PRIMARY KEY,
    first_name TEXT,
    email TEXT NOT NULL,
    consent_given INTEGER NOT NULL,
    source TEXT NOT NULL,
    resource_name TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    claimed_uid TEXT,
    claimed_email TEXT,
    password_hash TEXT,
    password_salt TEXT,
    updated_at TEXT NOT NULL
  );
`);

function seedInitialData() {
  const countRow = db
    .prepare('SELECT COUNT(*) AS count FROM products')
    .get() as { count: number };

  if (countRow.count === 0) {
    const insertProd = db.prepare(`
      INSERT INTO products (
        id, slug, title, subtitle, category, product_type, short_desc, full_desc,
        price, compare_at_price, price_note, is_demo_product, featured, created_at,
        card_bg, image, image_alt, gallery_json, whats_included_json, who_it_is_for_json,
        benefits_json, file_formats_json, compatibility_json, faqs_json, deliverable_summary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of SEED_PRODUCTS) {
      insertProd.run(
        p.id,
        p.slug,
        p.title,
        p.subtitle,
        p.category,
        p.productType,
        p.shortDesc,
        p.fullDesc,
        p.price,
        p.compareAtPrice ?? null,
        p.priceNote ?? null,
        p.isDemoProduct ? 1 : 0,
        p.featured ? 1 : 0,
        p.createdAt,
        p.cardBg,
        p.image,
        p.imageAlt,
        JSON.stringify(p.gallery),
        JSON.stringify(p.whatsIncluded),
        JSON.stringify(p.whoItIsFor),
        JSON.stringify(p.benefits),
        JSON.stringify(p.fileFormats),
        JSON.stringify(p.compatibility),
        JSON.stringify(p.faqs),
        p.deliverableSummary
      );
    }
  }

  const blogCount = db
    .prepare('SELECT COUNT(*) AS count FROM blog_articles')
    .get() as { count: number };

  if (blogCount.count === 0) {
    const insertBlog = db.prepare(`
      INSERT INTO blog_articles (
        id, slug, category, title, excerpt, published_at, read_time, image, image_alt, body_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const a of SEED_BLOG_ARTICLES) {
      insertBlog.run(
        a.id,
        a.slug,
        a.category,
        a.title,
        a.excerpt,
        a.publishedAt,
        a.readTime,
        a.image,
        a.imageAlt,
        JSON.stringify(a.body)
      );
    }
  }

  const couponCount = db
    .prepare('SELECT COUNT(*) AS count FROM discount_codes')
    .get() as { count: number };

  if (couponCount.count === 0) {
    const insertCoupon = db.prepare(`
      INSERT INTO discount_codes (code, percent_off, active, description)
      VALUES (?, ?, ?, ?)
    `);
    for (const c of SEED_DISCOUNT_CODES) {
      insertCoupon.run(c.code, c.percentOff, c.active ? 1 : 0, c.description);
    }
  }
}

seedInitialData();

export interface DbProductRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  product_type: string;
  short_desc: string;
  full_desc: string;
  price: number;
  compare_at_price: number | null;
  price_note: string | null;
  is_demo_product: number;
  featured: number;
  created_at: string;
  card_bg: string;
  image: string;
  image_alt: string;
  gallery_json: string;
  whats_included_json: string;
  who_it_is_for_json: string;
  benefits_json: string;
  file_formats_json: string;
  compatibility_json: string;
  faqs_json: string;
  deliverable_summary: string;
  deliverable_file_key: string | null;
  deliverable_file_name: string | null;
  deliverable_file_size: number | null;
  deliverable_mime_type: string | null;
}

export function mapProductRow(row: DbProductRow) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    category: row.category,
    productType: row.product_type,
    shortDesc: row.short_desc,
    fullDesc: row.full_desc,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price !== null ? Number(row.compare_at_price) : undefined,
    priceNote: row.price_note ?? undefined,
    isDemoProduct: row.is_demo_product === 1,
    featured: row.featured === 1,
    createdAt: row.created_at,
    cardBg: row.card_bg,
    image: row.image,
    imageAlt: row.image_alt,
    gallery: JSON.parse(row.gallery_json) as { src: string; alt: string; caption: string }[],
    whatsIncluded: JSON.parse(row.whats_included_json) as string[],
    whoItIsFor: JSON.parse(row.who_it_is_for_json) as string[],
    benefits: JSON.parse(row.benefits_json) as string[],
    fileFormats: JSON.parse(row.file_formats_json) as string[],
    compatibility: JSON.parse(row.compatibility_json) as string[],
    faqs: JSON.parse(row.faqs_json) as { q: string; a: string }[],
    deliverableSummary: row.deliverable_summary,
    hasUploadedFile: Boolean(row.deliverable_file_key),
    deliverableFileName: row.deliverable_file_name ?? undefined,
    deliverableFileSize:
      row.deliverable_file_size !== null ? Number(row.deliverable_file_size) : undefined,
  };
}
