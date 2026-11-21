import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  auth,
  onAuthStateChanged,
  signOutUser,
  type User,
} from '../lib/firebase';
import { INITIAL_PRODUCTS } from '../data/catalog';
import type {
  BlogArticle,
  CartItem,
  FreeResource,
  NewsletterSubscriber,
  OrderRecord,
  Product,
} from '../types/store';

interface StoreContextValue {
  user: User | null;
  isAdmin: boolean;
  authLoading: boolean;
  catalogLoading: boolean;
  products: Product[];
  blogArticles: BlogArticle[];
  orders: OrderRecord[];
  cart: CartItem[];
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  activeFreeResource: FreeResource | null;
  setActiveFreeResource: (res: FreeResource | null) => void;
  addToCart: (productId: string, openDrawer?: boolean) => void;
  updateCartQty: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  refreshCatalog: () => Promise<void>;
  refreshMyOrders: () => Promise<void>;
  addLocalOrder: (order: OrderRecord) => void;
  addSubscriber: (
    sub: Omit<NewsletterSubscriber, 'id' | 'createdAt'>
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem('craftedlabs_cart_v1');
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [blogArticles, setBlogArticles] = useState<BlogArticle[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [cart, setCart] = useState<CartItem[]>(loadCart);

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeFreeResource, setActiveFreeResource] =
    useState<FreeResource | null>(null);

  const refreshCatalog = useCallback(async () => {
    try {
      const res = await fetch('/api/catalog');
      if (res.ok) {
        const data = (await res.json()) as {
          products: Product[];
          blogArticles: BlogArticle[];
        };
        setProducts(data.products);
        setBlogArticles(data.blogArticles);
      }
    } catch {
      // Keep fallback state if temporarily unreachable
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  const refreshMyOrders = useCallback(async () => {
    if (!auth.currentUser) {
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch('/api/orders/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as { orders: OrderRecord[] };
        setOrders(data.orders);
      }
    } catch {
      // ignore transient error
    }
  }, []);

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      if (firebaseUser) {
        void refreshMyOrders();
        void firebaseUser
          .getIdToken()
          .then((token) =>
            fetch('/api/admin/status', {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
          .then((res) => (res.ok ? res.json() : null))
          .then((data: { isAuthorized?: boolean; ownerOnlyDenied?: boolean } | null) => {
            setIsAdmin(Boolean(data && !data.ownerOnlyDenied));
          })
          .catch(() => setIsAdmin(false));
      } else {
        setOrders([]);
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, [refreshMyOrders]);

  useEffect(() => {
    localStorage.setItem('craftedlabs_cart_v1', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (productId: string, openDrawer = true) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { productId, qty: 1 }];
    });
    if (openDrawer) setCartDrawerOpen(true);
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, qty: item.qty + delta }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => setCart([]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const prod = products.find((p) => p.id === item.productId);
        return sum + (prod ? prod.price * item.qty : 0);
      }, 0),
    [cart, products]
  );

  const addLocalOrder = (order: OrderRecord) => {
    setOrders((prev) => [order, ...prev]);
  };

  const addSubscriber = async (
    sub: Omit<NewsletterSubscriber, 'id' | 'createdAt'>
  ) => {
    const res = await fetch('/api/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error || 'Could not save subscription. Please try again.');
    }
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        isAdmin,
        authLoading,
        catalogLoading,
        products,
        blogArticles,
        orders,
        cart,
        cartDrawerOpen,
        setCartDrawerOpen,
        searchOpen,
        setSearchOpen,
        activeFreeResource,
        setActiveFreeResource,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        refreshCatalog,
        refreshMyOrders,
        addLocalOrder,
        addSubscriber,
        signOut: signOutUser,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return ctx;
}
