import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Lock,
  Plus,
  ShieldAlert,
  Trash2,
  Upload,
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { CATEGORIES } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import type {
  CategoryId,
  ContactMessage,
  DiscountCode,
  NewsletterSubscriber,
  OrderRecord,
  Product,
} from '../types/store';

type AdminTab =
  | 'products'
  | 'orders'
  | 'subscribers'
  | 'messages'
  | 'blog'
  | 'discounts';

interface AdminStatus {
  isAuthorized: boolean;
  ownerOnlyDenied?: boolean;
  envPassConfigured: boolean;
  hasClaimedAdmin: boolean;
  requiresSetup: boolean;
  claimedEmail?: string;
}

interface AdminOverview {
  productCount: number;
  uploadedFileCount: number;
  orderCount: number;
  totalRevenue: number;
  subscriberCount: number;
  messageCount: number;
}

function formatBytes(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AdminPage() {
  const { user, blogArticles, refreshCatalog } = useStore();

  // Admin session token held strictly in React memory (never localStorage)
  const [adminToken, setAdminToken] = useState<string>('');
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  const [tab, setTab] = useState<AdminTab>('products');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [adminOrders, setAdminOrders] = useState<OrderRecord[]>([]);
  const [adminSubscribers, setAdminSubscribers] = useState<
    NewsletterSubscriber[]
  >([]);
  const [adminMessages, setAdminMessages] = useState<ContactMessage[]>([]);
  const [adminDiscounts, setAdminDiscounts] = useState<DiscountCode[]>([]);
  const [actionNotice, setActionNotice] = useState('');
  const [actionError, setActionError] = useState('');

  // Create Product Form
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryId>(
    'business-entrepreneurship'
  );
  const [newPrice, setNewPrice] = useState('12');
  const [newType, setNewType] = useState('Digital PDF & Template');
  const [newDesc, setNewDesc] = useState('');
  const [newPreviewUrl, setNewPreviewUrl] = useState('');
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null);
  const [creatingProduct, setCreatingProduct] = useState(false);

  // Per-product upload busy tracking
  const [uploadingPdfId, setUploadingPdfId] = useState<string | null>(null);
  const [uploadingImgId, setUploadingImgId] = useState<string | null>(null);

  // Edit Product inline
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriceVal, setEditPriceVal] = useState('');

  // Blog Form
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState('Small Business');
  const [blogExcerpt, setBlogExcerpt] = useState('');

  // Discount Form
  const [couponCode, setCouponCode] = useState('');
  const [couponPct, setCouponPct] = useState('20');

  const getAuthHeaders = useCallback(
    async (extra?: Record<string, string>) => {
      if (!auth.currentUser) throw new Error('Not signed in');
      const idToken = await auth.currentUser.getIdToken();
      const headers: Record<string, string> = {
        Authorization: `Bearer ${idToken}`,
        ...extra,
      };
      if (adminToken) {
        headers['X-Admin-Token'] = adminToken;
      }
      return headers;
    },
    [adminToken]
  );

  const fetchAdminStatus = useCallback(async () => {
    if (!auth.currentUser) return;
    setStatusLoading(true);
    setAuthError('');
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/status', { headers });
      if (res.ok) {
        const data = (await res.json()) as AdminStatus;
        setStatus(data);
      } else {
        setAuthError(`Backend status check failed (${res.status}).`);
      }
    } catch {
      setAuthError('Could not reach backend API (/api/admin/status).');
    } finally {
      setStatusLoading(false);
    }
  }, [getAuthHeaders]);

  const loadAdminWorkspaceData = useCallback(async () => {
    if (!auth.currentUser) return;
    try {
      const headers = await getAuthHeaders();
      const [ovRes, prodRes, ordRes, subRes, msgRes, discRes] = await Promise.all([
        fetch('/api/admin/overview', { headers }),
        fetch('/api/admin/products', { headers }),
        fetch('/api/admin/orders', { headers }),
        fetch('/api/admin/subscribers', { headers }),
        fetch('/api/admin/messages', { headers }),
        fetch('/api/admin/discounts', { headers }),
      ]);

      if (ovRes.ok) setOverview((await ovRes.json()) as AdminOverview);
      if (prodRes.ok) {
        const d = (await prodRes.json()) as { products: Product[] };
        setAdminProducts(d.products);
      }
      if (ordRes.ok) {
        const d = (await ordRes.json()) as { orders: OrderRecord[] };
        setAdminOrders(d.orders);
      }
      if (subRes.ok) {
        const d = (await subRes.json()) as {
          subscribers: NewsletterSubscriber[];
        };
        setAdminSubscribers(d.subscribers);
      }
      if (msgRes.ok) {
        const d = (await msgRes.json()) as { messages: ContactMessage[] };
        setAdminMessages(d.messages);
      }
      if (discRes.ok) {
        const d = (await discRes.json()) as { discountCodes: DiscountCode[] };
        setAdminDiscounts(d.discountCodes);
      }
    } catch {
      setActionError('Failed to load admin workspace data.');
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    if (user) {
      void fetchAdminStatus();
    } else {
      setStatus(null);
      setAdminToken('');
    }
  }, [user, fetchAdminStatus]);

  useEffect(() => {
    if (status?.isAuthorized) {
      void loadAdminWorkspaceData();
    }
  }, [status?.isAuthorized, loadAdminWorkspaceData]);

  const handleClaimOrUnlock = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthBusy(true);
    try {
      const endpoint = status?.requiresSetup
        ? '/api/admin/claim'
        : '/api/admin/unlock';
      const headers = await getAuthHeaders({
        'Content-Type': 'application/json',
      });
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = (await res.json()) as {
        adminToken?: string;
        error?: string;
      };
      if (!res.ok || !data.adminToken) {
        setAuthError(data.error || 'Could not authorize admin access.');
        return;
      }
      setAdminToken(data.adminToken);
      setPasswordInput('');
      setStatus((prev) =>
        prev
          ? { ...prev, isAuthorized: true, requiresSetup: false, hasClaimedAdmin: true }
          : {
              isAuthorized: true,
              envPassConfigured: false,
              hasClaimedAdmin: true,
              requiresSetup: false,
            }
      );
    } catch {
      setAuthError('Network error during admin verification.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleUploadPreviewForNew = async (file: File) => {
    setActionError('');
    try {
      const headers = await getAuthHeaders();
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/admin/upload/preview', {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setActionError(data.error || 'Preview upload failed.');
        return;
      }
      setNewPreviewUrl(data.url);
      setActionNotice('Preview image uploaded.');
    } catch {
      setActionError('Preview image upload error.');
    }
  };

  const handleCreateProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setActionError('');
    setActionNotice('');
    setCreatingProduct(true);

    try {
      const headers = await getAuthHeaders({
        'Content-Type': 'application/json',
      });
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: newTitle.trim(),
          subtitle: newSubtitle.trim() || newDesc.trim(),
          category: newCategory,
          productType: newType.trim(),
          shortDesc: newDesc.trim(),
          fullDesc: newDesc.trim(),
          price: Number(newPrice) || 0,
          image: newPreviewUrl || undefined,
          fileFormats: newPdfFile ? ['PDF'] : ['Digital Package'],
        }),
      });
      const data = (await res.json()) as { product?: Product; error?: string };
      if (!res.ok || !data.product) {
        setActionError(data.error || 'Could not create product.');
        setCreatingProduct(false);
        return;
      }

      if (newPdfFile) {
        const uploadHeaders = await getAuthHeaders();
        const fd = new FormData();
        fd.append('file', newPdfFile);
        const upRes = await fetch(
          `/api/admin/products/${encodeURIComponent(data.product.id)}/deliverable`,
          { method: 'POST', headers: uploadHeaders, body: fd }
        );
        if (!upRes.ok) {
          const upErr = (await upRes.json()) as { error?: string };
          setActionError(
            upErr.error || 'Product created, but PDF upload failed.'
          );
        }
      }

      setNewTitle('');
      setNewSubtitle('');
      setNewDesc('');
      setNewPreviewUrl('');
      setNewPdfFile(null);
      setActionNotice('Product saved to backend database.');
      await Promise.all([loadAdminWorkspaceData(), refreshCatalog()]);
    } catch {
      setActionError('Network error creating product.');
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleUploadProductPdf = async (productId: string, file: File) => {
    setActionError('');
    setActionNotice('');
    setUploadingPdfId(productId);
    try {
      const headers = await getAuthHeaders();
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(
        `/api/admin/products/${encodeURIComponent(productId)}/deliverable`,
        {
          method: 'POST',
          headers,
          body: fd,
        }
      );
      const data = (await res.json()) as { product?: Product; error?: string };
      if (!res.ok) {
        setActionError(data.error || 'Could not upload PDF deliverable.');
        return;
      }
      setActionNotice(
        `Uploaded "${data.product?.deliverableFileName || file.name}" securely to private storage.`
      );
      await Promise.all([loadAdminWorkspaceData(), refreshCatalog()]);
    } catch {
      setActionError('Failed uploading deliverable file.');
    } finally {
      setUploadingPdfId(null);
    }
  };

  const handleReplaceProductImage = async (productId: string, file: File) => {
    setActionError('');
    setActionNotice('');
    setUploadingImgId(productId);
    try {
      const uploadHeaders = await getAuthHeaders();
      const fd = new FormData();
      fd.append('image', file);
      const upRes = await fetch('/api/admin/upload/preview', {
        method: 'POST',
        headers: uploadHeaders,
        body: fd,
      });
      const upData = (await upRes.json()) as { url?: string; error?: string };
      if (!upRes.ok || !upData.url) {
        setActionError(upData.error || 'Preview upload failed.');
        return;
      }

      const jsonHeaders = await getAuthHeaders({
        'Content-Type': 'application/json',
      });
      await fetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify({ image: upData.url }),
      });

      setActionNotice('Product preview image updated.');
      await Promise.all([loadAdminWorkspaceData(), refreshCatalog()]);
    } catch {
      setActionError('Failed updating product preview image.');
    } finally {
      setUploadingImgId(null);
    }
  };

  const handleUpdateProduct = async (
    productId: string,
    patch: Partial<{
      title: string;
      subtitle: string;
      shortDesc: string;
      fullDesc: string;
      price: number;
      featured: boolean;
    }>
  ) => {
    setActionError('');
    setActionNotice('');
    try {
      const headers = await getAuthHeaders({
        'Content-Type': 'application/json',
      });
      const res = await fetch(
        `/api/admin/products/${encodeURIComponent(productId)}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify(patch),
        }
      );
      if (res.ok) {
        setEditingProductId(null);
        setActionNotice('Product changes saved to live catalog.');
        await Promise.all([loadAdminWorkspaceData(), refreshCatalog()]);
      } else {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setActionError(d.error || 'Could not update product.');
      }
    } catch {
      setActionError('Could not update product.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setActionError('');
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(
        `/api/admin/products/${encodeURIComponent(productId)}`,
        {
          method: 'DELETE',
          headers,
        }
      );
      if (res.ok) {
        setActionNotice('Product removed from database.');
        await Promise.all([loadAdminWorkspaceData(), refreshCatalog()]);
      }
    } catch {
      setActionError('Failed to delete product.');
    }
  };

  const handleAddBlog = async (e: FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim()) return;
    setActionError('');
    try {
      const headers = await getAuthHeaders({
        'Content-Type': 'application/json',
      });
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: blogTitle.trim(),
          category: blogCategory,
          excerpt: blogExcerpt.trim(),
        }),
      });
      if (res.ok) {
        setBlogTitle('');
        setBlogExcerpt('');
        setActionNotice('Blog article published.');
        await refreshCatalog();
      }
    } catch {
      setActionError('Failed publishing article.');
    }
  };

  const handleDeleteBlog = async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/blog/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) await refreshCatalog();
    } catch {
      setActionError('Failed deleting article.');
    }
  };

  const handleAddCoupon = async (e: FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      const headers = await getAuthHeaders({
        'Content-Type': 'application/json',
      });
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          code: couponCode.trim(),
          percentOff: Number(couponPct) || 10,
        }),
      });
      if (res.ok) {
        setCouponCode('');
        await loadAdminWorkspaceData();
      }
    } catch {
      setActionError('Failed creating discount code.');
    }
  };

  const handleToggleCoupon = async (code: string) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(
        `/api/admin/discounts/${encodeURIComponent(code)}/toggle`,
        { method: 'PATCH', headers }
      );
      if (res.ok) await loadAdminWorkspaceData();
    } catch {
      setActionError('Failed updating discount code.');
    }
  };

  if (!user) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#D6F0EE] px-5">
        <div className="max-w-md mx-auto rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-8 text-center space-y-4">
          <Lock className="w-8 h-8 text-[#3d5740] mx-auto" />
          <h1 className="font-display font-bold text-2xl text-[#202020]">
            Admin Sign-In Required
          </h1>
          <p className="text-sm text-[#5C5C5C]">
            Sign in with Firebase Authentication first to access the server-protected
            CraftedLabs Admin Workspace.
          </p>
          <Link
            to="/account"
            className="inline-flex px-6 py-3 rounded-full bg-[#3d5740] text-[#FFFDF7] text-sm font-semibold"
          >
            Sign In via Account
          </Link>
        </div>
      </div>
    );
  }

  if (statusLoading) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#D6F0EE] flex items-center justify-center">
        <p className="text-sm font-medium text-[#5C5C5C]">
          Verifying store owner access with backend...
        </p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#D6F0EE] px-5">
        <div className="max-w-md mx-auto rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-8 text-center space-y-4">
          <ShieldAlert className="w-8 h-8 text-[#3d5740] mx-auto" />
          <h1 className="font-display font-bold text-xl text-[#202020]">
            Backend Connection Needed
          </h1>
          <p className="text-sm text-[#5C5C5C]">
            {authError || 'Could not verify admin session with the backend API.'}
          </p>
          <button
            type="button"
            onClick={() => void fetchAdminStatus()}
            className="px-6 py-2.5 rounded-full bg-[#3d5740] text-[#FFFDF7] text-xs font-semibold cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (status.ownerOnlyDenied) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#D6F0EE] px-5">
        <div className="max-w-md mx-auto rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-8 text-center space-y-4">
          <Lock className="w-8 h-8 text-[#3d5740] mx-auto" />
          <h1 className="font-display font-bold text-2xl text-[#202020]">
            Store Owner Access Only
          </h1>
          <p className="text-sm text-[#5C5C5C] leading-relaxed">
            Signed in as <strong>{user.email}</strong>. This Admin Workspace is
            restricted exclusively to the CraftedLabs store owner.
          </p>
          <Link
            to="/account"
            className="inline-flex px-6 py-2.5 rounded-full bg-[#3d5740] text-[#FFFDF7] text-xs font-semibold"
          >
            Go to Customer Account
          </Link>
        </div>
      </div>
    );
  }

  if (!status.isAuthorized) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#D6F0EE] px-5">
        <div className="max-w-md mx-auto rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-8 space-y-5">
          <div className="flex items-center gap-2 text-[#3d5740]">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {status.requiresSetup
                ? 'First-Run Admin Claim'
                : 'Server-Verified Admin Login'}
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl text-[#202020]">
            {status.requiresSetup
              ? 'Claim Store Admin Password'
              : 'Unlock Admin Workspace'}
          </h1>
          <p className="text-xs text-[#5C5C5C] leading-relaxed">
            Signed in as <strong>{user.email}</strong>.{' '}
            {status.requiresSetup
              ? 'No admin passcode is set yet. Choose an 8+ character password to claim admin ownership on the server.'
              : 'Enter your server admin password to receive an in-memory authorized admin session.'}
          </p>
          <form onSubmit={handleClaimOrUnlock} className="space-y-3">
            <input
              type="password"
              required
              minLength={status.requiresSetup ? 8 : 1}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder={
                status.requiresSetup
                  ? 'Create admin password (8+ chars)'
                  : 'Enter admin password'
              }
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#202020]/15 text-sm focus:outline-none focus:border-[#3d5740]"
            />
            {authError && <p className="text-xs text-red-700">{authError}</p>}
            <button
              type="submit"
              disabled={authBusy}
              className="w-full py-3 rounded-full bg-[#3d5740] hover:bg-[#314734] disabled:opacity-60 text-[#FFFDF7] text-sm font-semibold cursor-pointer"
            >
              {authBusy
                ? 'Verifying...'
                : status.requiresSetup
                ? 'Set Password & Open Admin'
                : 'Unlock Admin Workspace'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#D6F0EE]">
      <div className="max-w-[1360px] mx-auto px-5 md:px-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#3d5740]">
              Server-Protected Store Administration · SQLite Backend
            </p>
            <h1 className="font-display font-extrabold text-3xl md:text-4xl text-[#202020] mt-1">
              CraftedLabs Admin Workspace
            </h1>
          </div>
          <span className="text-xs text-[#5C5C5C]">
            Operator: <strong className="text-[#202020]">{user.email}</strong>
          </span>
        </div>

        {/* Real SQLite KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-5">
            <p className="text-xs text-[#777777]">Catalog Products</p>
            <p className="font-mono-tabular font-bold text-2xl text-[#202020] mt-1">
              {overview?.productCount ?? adminProducts.length}
            </p>
          </div>
          <div className="rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-5">
            <p className="text-xs text-[#777777]">Uploaded PDFs / Files</p>
            <p className="font-mono-tabular font-bold text-2xl text-[#3d5740] mt-1">
              {overview?.uploadedFileCount ?? 0}
            </p>
          </div>
          <div className="rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-5">
            <p className="text-xs text-[#777777]">Demo Orders</p>
            <p className="font-mono-tabular font-bold text-2xl text-[#202020] mt-1">
              {overview?.orderCount ?? adminOrders.length}
            </p>
          </div>
          <div className="rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-5">
            <p className="text-xs text-[#777777]">Demo Order Volume</p>
            <p className="font-mono-tabular font-bold text-2xl text-[#3d5740] mt-1">
              ${(overview?.totalRevenue ?? 0).toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-5">
            <p className="text-xs text-[#777777]">Subscribers &amp; Leads</p>
            <p className="font-mono-tabular font-bold text-2xl text-[#202020] mt-1">
              {overview?.subscriberCount ?? adminSubscribers.length}
            </p>
          </div>
        </div>

        {actionNotice && (
          <div className="rounded-xl bg-[#FFFDF7] border border-[#3d5740]/30 px-4 py-3 text-xs font-semibold text-[#3d5740] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}
        {actionError && (
          <div className="rounded-xl bg-[#F8D7DF] px-4 py-3 text-xs font-semibold text-[#202020]">
            {actionError}
          </div>
        )}

        {/* Workspace Tabs */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'products', label: 'Products & PDF Files' },
              { id: 'orders', label: `Orders (${adminOrders.length})` },
              {
                id: 'subscribers',
                label: `Subscribers (${adminSubscribers.length})`,
              },
              { id: 'messages', label: `Messages (${adminMessages.length})` },
              { id: 'blog', label: `Blog (${blogArticles.length})` },
              { id: 'discounts', label: 'Discount Codes' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer ${
                tab === t.id
                  ? 'bg-[#3d5740] text-[#FFFDF7]'
                  : 'bg-[#FFFDF7] text-[#5C5C5C] border border-[#202020]/12 hover:text-[#202020]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Create Product + Upload PDF Form */}
            <form
              onSubmit={handleCreateProduct}
              className="lg:col-span-4 rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-6 space-y-4"
            >
              <h2 className="font-display font-bold text-lg text-[#202020]">
                Create Product &amp; Upload PDF
              </h2>

              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Product title"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202020]/15 text-sm"
              />
              <input
                type="text"
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                placeholder="Short tagline / subtitle"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202020]/15 text-sm"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as CategoryId)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202020]/15 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Price (USD)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202020]/15 text-sm"
                />
                <input
                  type="text"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  placeholder="Type (e.g. PDF Guide)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202020]/15 text-sm"
                />
              </div>
              <textarea
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Product description"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202020]/15 text-sm"
              />

              {/* Preview Image Upload */}
              <div className="p-3.5 rounded-xl bg-[#F4F1E8]/70 border border-[#202020]/10 space-y-2">
                <p className="text-xs font-semibold text-[#202020] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#3d5740]" />
                  Preview Image (optional)
                </p>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleUploadPreviewForNew(f);
                  }}
                  className="block w-full text-xs text-[#5C5C5C]"
                />
                {newPreviewUrl && (
                  <p className="text-[11px] text-[#3d5740] font-medium truncate">
                    Uploaded: {newPreviewUrl}
                  </p>
                )}
              </div>

              {/* Digital PDF File Upload */}
              <div className="p-3.5 rounded-xl bg-[#D6F0EE]/55 border border-[#3d5740]/25 space-y-2">
                <p className="text-xs font-semibold text-[#202020] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#3d5740]" />
                  Upload Digital File (PDF / XLSX / ZIP)
                </p>
                <input
                  type="file"
                  accept=".pdf,.xlsx,.xls,.csv,.md,.txt,.zip"
                  onChange={(e) => setNewPdfFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-xs text-[#5C5C5C]"
                />
                {newPdfFile && (
                  <p className="text-[11px] text-[#3d5740] font-medium">
                    Ready: {newPdfFile.name} ({formatBytes(newPdfFile.size)})
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={creatingProduct}
                className="w-full py-3 rounded-full bg-[#3d5740] hover:bg-[#314734] disabled:opacity-60 text-[#FFFDF7] text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {creatingProduct ? 'Saving Product...' : 'Save Product to Backend'}
              </button>
            </form>

            {/* Product List + Direct PDF Uploader per Product */}
            <div className="lg:col-span-8 rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-6 space-y-4">
              <h2 className="font-display font-bold text-lg text-[#202020]">
                Catalog Products &amp; Private PDF Deliverables
              </h2>

              <div className="space-y-4">
                {adminProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-[#202020]/12 bg-white space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.image}
                          alt={p.imageAlt}
                          className="w-16 h-12 rounded-lg object-cover border border-[#202020]/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-display font-bold text-sm text-[#202020] truncate">
                            {p.title}
                          </p>
                          <p className="text-xs text-[#5C5C5C] truncate">
                            ${p.price} USD · {p.productType}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (editingProductId === p.id) {
                              setEditingProductId(null);
                            } else {
                              setEditingProductId(p.id);
                              setEditTitle(p.title);
                              setEditSubtitle(p.subtitle);
                              setEditDesc(p.shortDesc);
                              setEditPriceVal(String(p.price));
                            }
                          }}
                          className="px-3 py-1.5 rounded-full border border-[#202020]/15 text-xs font-medium cursor-pointer hover:bg-[#F4F1E8]"
                        >
                          {editingProductId === p.id ? 'Close Edit' : 'Edit Product'}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void handleUpdateProduct(p.id, {
                              featured: !p.featured,
                            })
                          }
                          className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer ${
                            p.featured
                              ? 'bg-[#3d5740] text-[#FFFDF7]'
                              : 'border border-[#202020]/15 text-[#5C5C5C]'
                          }`}
                        >
                          {p.featured ? 'Featured' : 'Feature'}
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDeleteProduct(p.id)}
                          aria-label={`Delete ${p.title}`}
                          className="p-1.5 text-[#777777] hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {editingProductId === p.id && (
                      <div className="p-4 rounded-xl bg-[#F4F1E8]/70 border border-[#202020]/10 space-y-3 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Title"
                            className="sm:col-span-2 px-3 py-2 rounded-lg bg-white border border-[#202020]/15"
                          />
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={editPriceVal}
                            onChange={(e) => setEditPriceVal(e.target.value)}
                            placeholder="Price USD"
                            className="px-3 py-2 rounded-lg bg-white border border-[#202020]/15 font-mono-tabular"
                          />
                        </div>
                        <input
                          type="text"
                          value={editSubtitle}
                          onChange={(e) => setEditSubtitle(e.target.value)}
                          placeholder="Subtitle"
                          className="w-full px-3 py-2 rounded-lg bg-white border border-[#202020]/15"
                        />
                        <textarea
                          rows={2}
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          placeholder="Short & full description"
                          className="w-full px-3 py-2 rounded-lg bg-white border border-[#202020]/15"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingProductId(null)}
                            className="px-4 py-1.5 rounded-full border border-[#202020]/15 bg-white font-medium cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void handleUpdateProduct(p.id, {
                                title: editTitle.trim(),
                                subtitle: editSubtitle.trim(),
                                shortDesc: editDesc.trim(),
                                fullDesc: editDesc.trim(),
                                price: Math.max(0, Number(editPriceVal) || 0),
                              })
                            }
                            className="px-5 py-1.5 rounded-full bg-[#3d5740] text-[#FFFDF7] font-semibold cursor-pointer"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    )}

                    {/* PDF Deliverable & Preview Upload Bar */}
                    <div className="pt-3 border-t border-[#202020]/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-[#5C5C5C] min-w-0">
                        <FileText className="w-4 h-4 text-[#3d5740] shrink-0" />
                        {p.hasUploadedFile ? (
                          <span className="truncate font-medium text-[#3d5740]">
                            Private Deliverable: {p.deliverableFileName} (
                            {formatBytes(p.deliverableFileSize)})
                          </span>
                        ) : (
                          <span className="truncate text-[#777777]">
                            No PDF uploaded yet (uses generated starter file on download)
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D6F0EE] hover:bg-[#c5e8e5] text-[#202020] font-semibold cursor-pointer">
                          <Upload className="w-3.5 h-3.5 text-[#3d5740]" />
                          <span>
                            {uploadingPdfId === p.id
                              ? 'Uploading PDF...'
                              : p.hasUploadedFile
                              ? 'Replace PDF / File'
                              : 'Upload PDF'}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.xlsx,.xls,.csv,.md,.txt,.zip"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) void handleUploadProductPdf(p.id, file);
                              e.target.value = '';
                            }}
                          />
                        </label>

                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#202020]/15 hover:bg-[#F4F1E8] text-[#202020] font-medium cursor-pointer">
                          <ImageIcon className="w-3.5 h-3.5 text-[#5C5C5C]" />
                          <span>
                            {uploadingImgId === p.id ? 'Uploading...' : 'Preview Img'}
                          </span>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) void handleReplaceProductImage(p.id, file);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-6">
            <h2 className="font-display font-bold text-lg text-[#202020] mb-4">
              Orders (SQLite Backend)
            </h2>
            {adminOrders.length === 0 ? (
              <p className="text-sm text-[#5C5C5C]">No orders placed yet.</p>
            ) : (
              <div className="space-y-3">
                {adminOrders.map((o) => (
                  <div
                    key={o.id}
                    className="p-4 rounded-xl border border-[#202020]/10 flex flex-wrap justify-between gap-3 text-sm bg-white"
                  >
                    <div>
                      <p className="font-mono-tabular font-bold text-[#202020]">
                        {o.id} · {o.customerEmail}
                      </p>
                      <p className="text-xs text-[#5C5C5C] mt-1">
                        {o.items.map((i) => `${i.title} (x${i.qty})`).join(', ')} ·{' '}
                        Downloads: {o.downloadCount}
                      </p>
                    </div>
                    <span className="font-mono-tabular font-bold text-[#3d5740]">
                      ${o.total.toFixed(2)} USD
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'subscribers' && (
          <div className="rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-6">
            <h2 className="font-display font-bold text-lg text-[#202020] mb-4">
              Newsletter &amp; Free Resource Subscribers
            </h2>
            {adminSubscribers.length === 0 ? (
              <p className="text-sm text-[#5C5C5C]">
                No subscribers recorded yet.
              </p>
            ) : (
              <div className="space-y-2">
                {adminSubscribers.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl border border-[#202020]/10 bg-white flex flex-wrap justify-between gap-2 text-xs"
                  >
                    <span className="font-semibold text-[#202020]">
                      {s.firstName ? `${s.firstName} · ` : ''}
                      {s.email}
                    </span>
                    <span className="text-[#5C5C5C]">
                      {s.source}
                      {s.resourceName ? ` (${s.resourceName})` : ''} ·{' '}
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'messages' && (
          <div className="rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-6">
            <h2 className="font-display font-bold text-lg text-[#202020] mb-4">
              Contact Inbox Messages
            </h2>
            {adminMessages.length === 0 ? (
              <p className="text-sm text-[#5C5C5C]">No contact messages yet.</p>
            ) : (
              <div className="space-y-3">
                {adminMessages.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl border border-[#202020]/10 bg-white space-y-1.5"
                  >
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[#202020]">
                        {m.name} ({m.email})
                      </span>
                      <span className="text-[#777777]">
                        {new Date(m.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-[#5C5C5C]">{m.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'blog' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <form
              onSubmit={handleAddBlog}
              className="lg:col-span-4 rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-6 space-y-4"
            >
              <h2 className="font-display font-bold text-lg text-[#202020]">
                Publish Editorial Post
              </h2>
              <input
                type="text"
                required
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                placeholder="Article title"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202020]/15 text-sm"
              />
              <input
                type="text"
                value={blogCategory}
                onChange={(e) => setBlogCategory(e.target.value)}
                placeholder="Category"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202020]/15 text-sm"
              />
              <textarea
                rows={4}
                value={blogExcerpt}
                onChange={(e) => setBlogExcerpt(e.target.value)}
                placeholder="Article summary & body"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202020]/15 text-sm"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#3d5740] text-[#FFFDF7] text-xs font-semibold cursor-pointer"
              >
                Publish Post
              </button>
            </form>

            <div className="lg:col-span-8 rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-[#202020]">
                Published Articles
              </h2>
              {blogArticles.map((art) => (
                <div
                  key={art.id}
                  className="p-3.5 rounded-xl border border-[#202020]/10 bg-white flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold text-sm text-[#202020]">
                      {art.title}
                    </p>
                    <p className="text-xs text-[#777777]">
                      {art.category} · {art.publishedAt}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDeleteBlog(art.id)}
                    aria-label={`Delete ${art.title}`}
                    className="p-1.5 text-[#777777] hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'discounts' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <form
              onSubmit={handleAddCoupon}
              className="lg:col-span-4 rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-6 space-y-4"
            >
              <h2 className="font-display font-bold text-lg text-[#202020]">
                Create Discount Code
              </h2>
              <input
                type="text"
                required
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Code (e.g. LAUNCH20)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202020]/15 text-sm uppercase"
              />
              <input
                type="number"
                min="1"
                max="90"
                value={couponPct}
                onChange={(e) => setCouponPct(e.target.value)}
                placeholder="Percent off"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202020]/15 text-sm"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#3d5740] text-[#FFFDF7] text-xs font-semibold cursor-pointer"
              >
                Add Code
              </button>
            </form>

            <div className="lg:col-span-8 rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-[#202020]">
                Active &amp; Inactive Codes
              </h2>
              {adminDiscounts.map((d) => (
                <div
                  key={d.code}
                  className="p-3.5 rounded-xl border border-[#202020]/10 bg-white flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-mono-tabular font-bold text-sm text-[#202020]">
                      {d.code} — {d.percentOff}% off
                    </p>
                    <p className="text-xs text-[#5C5C5C]">{d.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleToggleCoupon(d.code)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                      d.active
                        ? 'bg-[#3d5740] text-[#FFFDF7]'
                        : 'bg-[#F4F1E8] text-[#5C5C5C]'
                    }`}
                  >
                    {d.active ? 'Active' : 'Paused'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
