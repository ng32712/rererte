export type CategoryId =
  | 'business-entrepreneurship'
  | 'ai-technology'
  | 'programming-design'
  | 'education-productivity';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  shortDesc: string;
  cardBg: string;
  image: string;
  imageAlt: string;
}

export interface ProductFAQ {
  q: string;
  a: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: CategoryId;
  productType: string;
  shortDesc: string;
  fullDesc: string;
  price: number;
  compareAtPrice?: number;
  priceNote?: string;
  isDemoProduct: boolean;
  featured: boolean;
  createdAt: string;
  cardBg: string;
  image: string;
  imageAlt: string;
  gallery: { src: string; alt: string; caption: string }[];
  whatsIncluded: string[];
  whoItIsFor: string[];
  benefits: string[];
  fileFormats: string[];
  compatibility: string[];
  faqs: ProductFAQ[];
  deliverableSummary: string;
  hasUploadedFile?: boolean;
  deliverableFileName?: string;
  deliverableFileSize?: number;
}

export interface FreeResource {
  id: string;
  title: string;
  category: CategoryId;
  format: string;
  shortDesc: string;
  cardBg: string;
  image: string;
  imageAlt: string;
  fileName: string;
  fileContent: string;
}

export interface BlogArticle {
  id: string;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readTime: string;
  image: string;
  imageAlt: string;
  body: string[];
}

export interface CartItem {
  productId: string;
  qty: number;
}

export interface DiscountCode {
  code: string;
  percentOff: number;
  active: boolean;
  description: string;
}

export type PaymentMethodId = 'demo-card' | 'demo-momo' | 'demo-mor';

export interface OrderRecord {
  id: string;
  createdAt: string;
  customerEmail: string;
  userId?: string;
  items: {
    productId: string;
    title: string;
    productType: string;
    unitPrice: number;
    qty: number;
  }[];
  subtotal: number;
  discountCode?: string;
  discountAmount: number;
  total: number;
  currency: 'USD';
  paymentMethod: PaymentMethodId;
  paymentProviderName: string;
  status: 'Demo Confirmed';
  downloadCount: number;
  lastDownloadedAt?: string;
  receiptToken?: string;
}

export interface NewsletterSubscriber {
  id: string;
  firstName?: string;
  email: string;
  consentGiven: boolean;
  source: 'newsletter' | 'free-resource';
  resourceName?: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}
