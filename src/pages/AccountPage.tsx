import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Download,
  KeyRound,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import {
  mapAuthError,
  sendPasswordReset,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  updateUserProfileName,
} from '../lib/firebase';
import { downloadVerifiedProductPackage } from '../lib/payments';
import { useStore } from '../context/StoreContext';

type AuthMode = 'signin' | 'signup' | 'reset';
type DashTab = 'overview' | 'orders' | 'downloads' | 'settings';

export default function AccountPage() {
  const {
    user,
    isAdmin,
    authLoading,
    orders,
    products,
    refreshMyOrders,
    signOut,
  } = useStore();

  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');

  const [tab, setTab] = useState<DashTab>('overview');
  const [profileName, setProfileName] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthNotice('');
    setAuthBusy(true);
    try {
      if (authMode === 'signin') {
        await signInWithEmail(email, password);
      } else if (authMode === 'signup') {
        await signUpWithEmail(name, email, password);
      } else {
        await sendPasswordReset(email);
        setAuthNotice('Password reset instructions sent to your email.');
      }
    } catch (err) {
      setAuthError(mapAuthError(err));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setAuthNotice('');
    setAuthBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(mapAuthError(err));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSaveName = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !profileName.trim()) return;
    try {
      await updateUserProfileName(user, profileName);
      setProfileMsg('Display name updated.');
    } catch (err) {
      setProfileMsg(mapAuthError(err));
    }
  };

  if (authLoading) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#D6F0EE] flex items-center justify-center">
        <p className="text-sm font-medium text-[#5C5C5C]">
          Checking Firebase session...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-28 pb-24 min-h-screen bg-[#D6F0EE] px-5">
        <div className="max-w-md mx-auto rounded-3xl bg-[#FFFDF7] border border-[#202020]/12 p-7 md:p-9 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#3d5740]">
            Firebase Authentication
          </p>
          <h1 className="font-display font-extrabold text-3xl text-[#202020] mt-1">
            {authMode === 'signin'
              ? 'Sign in to CraftedLabs'
              : authMode === 'signup'
              ? 'Create your account'
              : 'Reset password'}
          </h1>
          <p className="text-sm text-[#5C5C5C] mt-2">
            Access your verified backend order history, purchased PDFs, and
            account preferences.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#F4F1E8]">
            {(['signin', 'signup', 'reset'] as AuthMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setAuthMode(m);
                  setAuthError('');
                  setAuthNotice('');
                }}
                className={`py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  authMode === m
                    ? 'bg-[#FFFDF7] text-[#202020] shadow-xs'
                    : 'text-[#5C5C5C] hover:text-[#202020]'
                }`}
              >
                {m === 'signin' ? 'Sign In' : m === 'signup' ? 'Sign Up' : 'Recover'}
              </button>
            ))}
          </div>

          <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
            {authMode === 'signup' && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-xs font-medium text-[#5C5C5C] mb-1"
                >
                  Full Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mugisha"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#202020]/15 text-sm text-[#202020] focus:outline-none focus:border-[#3d5740]"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-medium text-[#5C5C5C] mb-1"
              >
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#202020]/15 text-sm text-[#202020] focus:outline-none focus:border-[#3d5740]"
              />
            </div>

            {authMode !== 'reset' && (
              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-medium text-[#5C5C5C] mb-1"
                >
                  Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#202020]/15 text-sm text-[#202020] focus:outline-none focus:border-[#3d5740]"
                />
              </div>
            )}

            {authError && (
              <p className="p-3 rounded-xl bg-[#F8D7DF] text-xs font-medium text-[#202020]">
                {authError}
              </p>
            )}
            {authNotice && (
              <p className="p-3 rounded-xl bg-[#D6F0EE] text-xs font-medium text-[#3d5740]">
                {authNotice}
              </p>
            )}

            <button
              type="submit"
              disabled={authBusy}
              className="w-full py-3 px-5 rounded-full bg-[#3d5740] hover:bg-[#314734] disabled:opacity-60 text-[#FFFDF7] text-sm font-semibold btn-tactile cursor-pointer"
            >
              {authBusy
                ? 'Please wait...'
                : authMode === 'signin'
                ? 'Sign In'
                : authMode === 'signup'
                ? 'Create Account'
                : 'Send Reset Email'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-[#777777]">
            <div className="h-px flex-1 bg-[#202020]/10" />
            <span>or</span>
            <div className="h-px flex-1 bg-[#202020]/10" />
          </div>

          <button
            type="button"
            disabled={authBusy}
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-5 rounded-full border border-[#202020]/20 bg-white hover:bg-[#F4F1E8] text-sm font-semibold text-[#202020] btn-tactile cursor-pointer"
          >
            Continue with Google
          </button>

          <p className="mt-5 text-[11px] text-[#777777] text-center leading-relaxed">
            Connected to Firebase Auth project{' '}
            <span className="font-mono-tabular">bounty-c1dfb</span>.
          </p>
        </div>
      </div>
    );
  }

  const purchasedItems = orders.flatMap((order) =>
    order.items.map((item) => ({
      order,
      item,
      product: products.find((p) => p.id === item.productId),
    }))
  );

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#D6F0EE]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#3d5740]">
              Customer Account
            </p>
            <h1 className="font-display font-extrabold text-3xl md:text-4xl text-[#202020] mt-1">
              Welcome, {user.displayName || user.email}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#202020]/20 bg-[#FFFDF7] hover:bg-[#F4F1E8] text-xs font-semibold text-[#202020] self-start cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {(
            [
              { id: 'overview', label: 'Overview', icon: UserIcon },
              { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
              {
                id: 'downloads',
                label: `Downloads (${purchasedItems.length})`,
                icon: Download,
              },
              { id: 'settings', label: 'Settings', icon: Settings },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  tab === t.id
                    ? 'bg-[#3d5740] text-[#FFFDF7]'
                    : 'bg-[#FFFDF7] text-[#5C5C5C] border border-[#202020]/12 hover:text-[#202020]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-6">
              <p className="text-xs text-[#777777]">Signed-in Email</p>
              <p className="font-semibold text-sm text-[#202020] mt-1 break-all">
                {user.email}
              </p>
              <p className="text-xs text-[#3d5740] mt-3 inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified by Backend &amp; Firebase
              </p>
            </div>
            <div className="rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-6">
              <p className="text-xs text-[#777777]">Verified Demo Orders</p>
              <p className="font-mono-tabular font-bold text-3xl text-[#202020] mt-1">
                {orders.length}
              </p>
            </div>
            <div className="rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-6">
              <p className="text-xs text-[#777777]">Available Downloads</p>
              <p className="font-mono-tabular font-bold text-3xl text-[#3d5740] mt-1">
                {purchasedItems.length}
              </p>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-6">
            <h2 className="font-display font-bold text-xl text-[#202020] mb-4">
              Order History
            </h2>
            {orders.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-[#5C5C5C]">
                  No orders recorded for this account yet.
                </p>
                <Link
                  to="/shop"
                  className="mt-4 inline-flex px-5 py-2.5 rounded-full bg-[#3d5740] text-[#FFFDF7] text-xs font-semibold"
                >
                  Explore Store
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl border border-[#202020]/10 bg-[#F4F1E8]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-mono-tabular font-bold text-sm text-[#202020]">
                        {order.id} · {order.status}
                      </p>
                      <p className="text-xs text-[#5C5C5C] mt-1">
                        {new Date(order.createdAt).toLocaleString()} ·{' '}
                        {order.items.map((i) => i.title).join(', ')}
                      </p>
                    </div>
                    <span className="font-mono-tabular font-bold text-base text-[#3d5740]">
                      ${order.total.toFixed(2)} USD
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'downloads' && (
          <div className="rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-6">
            <h2 className="font-display font-bold text-xl text-[#202020] mb-2">
              Purchased Products &amp; Download History
            </h2>
            <p className="text-xs text-[#5C5C5C] mb-5">
              Files are gated by server-side ownership checks and stream any PDF
              uploaded by the store admin.
            </p>
            {purchasedItems.length === 0 ? (
              <p className="text-sm text-[#5C5C5C] py-6">
                You have not completed a demo purchase yet.
              </p>
            ) : (
              <div className="space-y-3">
                {purchasedItems.map(({ order, item, product }) => {
                  const key = `${order.id}-${item.productId}`;
                  return (
                    <div
                      key={key}
                      className="p-4 rounded-xl border border-[#202020]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-display font-bold text-sm text-[#202020]">
                          {item.title}
                        </p>
                        <p className="text-xs text-[#777777] mt-0.5">
                          Order {order.id} · Downloads recorded:{' '}
                          <span className="font-mono-tabular">
                            {order.downloadCount}
                          </span>
                          {product?.hasUploadedFile && product.deliverableFileName
                            ? ` · File: ${product.deliverableFileName}`
                            : ''}
                        </p>
                      </div>
                      {product && (
                        <button
                          type="button"
                          disabled={downloadingKey === key}
                          onClick={async () => {
                            setDownloadingKey(key);
                            const ok = await downloadVerifiedProductPackage(
                              product,
                              order
                            );
                            if (ok) await refreshMyOrders();
                            setDownloadingKey(null);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3d5740] hover:bg-[#314734] disabled:opacity-60 text-[#FFFDF7] text-xs font-semibold cursor-pointer self-start"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {downloadingKey === key
                            ? 'Downloading...'
                            : product.hasUploadedFile
                            ? 'Download PDF / File'
                            : 'Download'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className="rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-6 max-w-lg space-y-6">
            <h2 className="font-display font-bold text-xl text-[#202020]">
              Account Settings
            </h2>
            <form onSubmit={handleSaveName} className="space-y-4">
              <div>
                <label
                  htmlFor="profile-name"
                  className="block text-xs font-medium text-[#5C5C5C] mb-1"
                >
                  Display Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder={user.displayName || 'Your Name'}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#202020]/15 text-sm text-[#202020] focus:outline-none focus:border-[#3d5740]"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#3d5740] text-[#FFFDF7] text-xs font-semibold cursor-pointer"
              >
                Update Profile Name
              </button>
              {profileMsg && (
                <p className="text-xs text-[#3d5740] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {profileMsg}
                </p>
              )}
            </form>

            {isAdmin && (
              <div className="pt-4 border-t border-[#202020]/10">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#3d5740] hover:underline"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Open Store Admin Workspace
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
