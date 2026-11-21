import { Suspense, lazy, useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import SearchModal from './components/SearchModal';
import FreeResourceModal from './components/FreeResourceModal';

const HomePage = lazy(() => import('./pages/HomePage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));

function ScrollHandler() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      window.setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [pathname, hash]);

  return null;
}

function PageLoader() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#D6F0EE]">
      <div className="text-sm font-medium text-[#3d5740]">
        Loading CraftedLabs...
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <div className="grain-overlay" aria-hidden="true" />
        <ScrollHandler />
        <Navbar />
        <main className="min-h-screen">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/legal/:type" element={<LegalPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <CartDrawer />
        <SearchModal />
        <FreeResourceModal />
      </StoreProvider>
    </BrowserRouter>
  );
}
