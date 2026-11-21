import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User as UserIcon, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Navbar() {
  const {
    user,
    isAdmin,
    cartCount,
    setCartDrawerOpen,
    setSearchOpen,
  } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  const handleCategoriesClick = () => {
    setMobileOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById('categories');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate('/shop');
  };

  const handleResourcesClick = () => {
    setMobileOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById('free-resources');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate('/#free-resources');
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap shrink-0 text-sm font-medium transition-colors py-1 border-b-2 ${
      isActive
        ? 'text-[#202020] border-[#3d5740]'
        : 'text-[#5C5C5C] border-transparent hover:text-[#202020] hover:border-[#3d5740]/40'
    }`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-200 ${
        scrolled
          ? 'bg-[#FFFDF7]/88 backdrop-blur-lg border-b border-[#202020]/10 shadow-sm'
          : 'bg-[#D6F0EE]/70 backdrop-blur-md border-b border-[#202020]/8'
      }`}
    >
      <div className="max-w-[1360px] mx-auto h-full px-5 md:px-10 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Lockup (single clean element) */}
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 font-display font-bold text-xl tracking-tight text-[#202020]"
          aria-label="CraftedLabs Home"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
            className="text-[#3d5740]"
          >
            <rect
              x="3"
              y="3"
              width="22"
              height="22"
              rx="6"
              stroke="currentColor"
              strokeWidth="2.2"
            />
            <path
              d="M9 18L14 9L19 18H9Z"
              fill="currentColor"
              fillOpacity="0.18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          <span>CraftedLabs</span>
        </Link>

        {/* Zone 2: Clean Single-Line Nav Links */}
        <nav
          className="hidden lg:flex items-center gap-6"
          aria-label="Primary Navigation"
        >
          <NavLink to="/" end className={navItemClass}>
            Home
          </NavLink>
          <NavLink to="/shop" className={navItemClass}>
            Shop
          </NavLink>
          <button
            type="button"
            onClick={handleCategoriesClick}
            className="whitespace-nowrap shrink-0 text-sm font-medium text-[#5C5C5C] hover:text-[#202020] py-1 border-b-2 border-transparent hover:border-[#3d5740]/40 transition-colors cursor-pointer"
          >
            Categories
          </button>
          <button
            type="button"
            onClick={handleResourcesClick}
            className="whitespace-nowrap shrink-0 text-sm font-medium text-[#5C5C5C] hover:text-[#202020] py-1 border-b-2 border-transparent hover:border-[#3d5740]/40 transition-colors cursor-pointer"
          >
            Free Resources
          </button>
          <NavLink to="/about" className={navItemClass}>
            About
          </NavLink>
          <NavLink to="/blog" className={navItemClass}>
            Blog
          </NavLink>
        </nav>

        {/* Zone 3: Search, Cart, Account & Primary CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search products and articles"
            className="w-10 h-10 rounded-full border border-[#202020]/15 bg-[#FFFDF7]/80 hover:bg-[#FFFDF7] flex items-center justify-center text-[#202020] transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setCartDrawerOpen(true)}
            aria-label="Open shopping cart"
            className="relative w-10 h-10 rounded-full border border-[#202020]/15 bg-[#FFFDF7]/80 hover:bg-[#FFFDF7] flex items-center justify-center text-[#202020] transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[19px] h-[19px] px-1 rounded-full bg-[#3d5740] text-[#FFFDF7] font-mono-tabular text-[11px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {isAdmin && (
            <Link
              to="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 px-3.5 py-2 rounded-full bg-[#F7EDB8] border border-[#202020]/15 hover:bg-[#f2e296] text-xs font-bold text-[#202020] transition-colors"
            >
              Admin
            </Link>
          )}

          <Link
            to="/account"
            className="hidden sm:inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 px-3.5 py-2 rounded-full border border-[#202020]/15 bg-[#FFFDF7]/80 hover:bg-[#FFFDF7] text-sm font-medium text-[#202020] transition-colors"
          >
            <UserIcon className="w-3.5 h-3.5 text-[#3d5740]" />
            <span>{user ? (user.displayName?.split(' ')[0] || 'Account') : 'Sign In'}</span>
          </Link>

          <Link
            to="/shop"
            className="hidden md:inline-flex items-center justify-center whitespace-nowrap shrink-0 px-5 py-2.5 rounded-full bg-[#3d5740] hover:bg-[#314734] text-[#FFFDF7] text-sm font-semibold btn-tactile"
          >
            Explore Products
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="lg:hidden w-10 h-10 rounded-full border border-[#202020]/15 bg-[#FFFDF7]/80 flex items-center justify-center text-[#202020] cursor-pointer"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#FFFDF7] border-b border-[#202020]/12 px-5 py-5 shadow-lg">
          <div className="flex flex-col gap-3">
            <Link to="/" className="py-2 text-base font-medium text-[#202020]">
              Home
            </Link>
            <Link to="/shop" className="py-2 text-base font-medium text-[#202020]">
              Shop
            </Link>
            <button
              type="button"
              onClick={handleCategoriesClick}
              className="py-2 text-left text-base font-medium text-[#202020] cursor-pointer"
            >
              Categories
            </button>
            <button
              type="button"
              onClick={handleResourcesClick}
              className="py-2 text-left text-base font-medium text-[#202020] cursor-pointer"
            >
              Free Resources
            </button>
            <Link to="/about" className="py-2 text-base font-medium text-[#202020]">
              About
            </Link>
            <Link to="/blog" className="py-2 text-base font-medium text-[#202020]">
              Blog
            </Link>
            <Link to="/account" className="py-2 text-base font-medium text-[#3d5740]">
              {user ? `Account (${user.email})` : 'Sign In / Create Account'}
            </Link>
            {isAdmin && (
              <Link to="/admin" className="py-2 text-base font-bold text-[#202020]">
                Store Admin Workspace
              </Link>
            )}
            <Link
              to="/shop"
              className="mt-2 inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#3d5740] text-[#FFFDF7] text-sm font-semibold"
            >
              Explore Products
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
