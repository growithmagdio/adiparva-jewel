export type Currency = number; // whole rupees, paise-free

export interface Category {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  image?: string;
  pieceCount: number;
  order: number;
  sortOrder?: number;
  featured: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  id: string;
  label: string; // "Gold-tone, 18 inch"
  metal: 'Gold-plated silver' | '22K gold' | 'Silver' | 'Antique gold finish' | '22kt gold plating over brass';
  sizeLabel?: string;
  priceDelta: Currency;
  stock: number;
  sku: string;
  image?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  code?: string; // Product Code e.g. AP-7K3QXM
  plateNumber?: string; // "PLATE AP-0104"
  categoryId: string;
  collectionTag?: 'Masterpiece' | 'New arrival' | 'Bridal' | 'Archive' | 'Bestseller';
  collection?: string;
  shortDescription: string; // 1 line, max 90 chars
  story: string; // Provenance story
  price: Currency;
  compareAtPrice?: Currency;
  images: string[]; // min 3-5 per product
  variants: ProductVariant[];
  specs: ProductSpec[]; // Weight, Plating, Base metal, Stones, Closure, Length, Care, Origin
  craftTime: string; // "6 weeks"
  artisanCluster: string; // "Madurai, Tamil Nadu"
  certification: string[]; // ["BIS Hallmarked", "Certificate of authenticity"]
  careNotes: string[];
  status: 'live' | 'draft' | 'archived';
  totalStock: number;
  lowStockThreshold?: number; // default 3
  rating: number;
  reviewCount: number;
  createdAt: string;

  // Additional Redesign Fine Jewellery Specifications
  weightGrams?: number;
  plating?: string;
  baseMetal?: string;
  stones?: string[];
  closure?: string;
  lengthInches?: string;
  occasion?: string[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  variantLabel?: string;
  code?: string;
  image: string;
  unitPrice: Currency;
  qty: number;
}

export interface OrderTimelineItem {
  status: OrderStatus;
  at: string;
  note: string;
}

export interface Order {
  id: string; // "ORD-7721"
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: Currency;
  discount: Currency;
  shipping: Currency;
  gst: Currency;
  total: Currency;
  couponCode?: string;
  status: OrderStatus;
  timeline: OrderTimelineItem[];
  shippingAddress: Address;
  paymentMethod: 'Card' | 'UPI' | 'Net banking' | 'Cash on delivery';
  paymentStatus?: 'paid' | 'pending' | 'cod_pending' | 'failed';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  placedAt: string;
  expectedBy: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
  orderCount: number;
  lifetimeValue: Currency;
  tier: 'Patron' | 'Collector' | 'Guest';
  joinedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'flat';
  value: number;
  minOrder: Currency;
  maxDiscount?: Currency;
  usageLimit: number;
  usedCount: number;
  startsAt: string;
  endsAt: string;
  status: 'active' | 'scheduled' | 'expired' | 'paused';
  appliesTo: 'all' | { categoryIds: string[] };
}

export interface SeasonalOffer {
  id: string;
  title: string;
  subtitle: string;
  bannerImage: string;
  discountPercent: number;
  categoryIds: string[];
  startsAt: string;
  endsAt: string;
  status: 'live' | 'scheduled' | 'ended';
}

export interface HeroSlide {
  id: string;
  eyebrow: string;
  headingItalic: string;
  headingRoman: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  order: number;
  active: boolean;
}

export type AdminRole = 'Chief Curator' | 'Curator' | 'Registrar' | 'Support';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatarInitials: string;
  lastActive: string;
  status: 'active' | 'invited' | 'suspended';
  permissions: string[];
}

export interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  publishedAt: string;
  readTime: string;
  heroImage: string;
  excerpt: string;
  content: string[]; // Paragraphs
  category: string;
  featured?: boolean;
}

export interface SiteContent {
  announcementBar: {
    enabled: boolean;
    messages?: string[];
    message?: string;
    linkHref?: string;
    linkLabel?: string;
  };
  houseStory: {
    heading: string;
    subheading: string;
    paragraphs: string[];
  };
  craftOverview: {
    heading: string;
    steps: { number: number; title: string; description: string }[];
  };
  careGuide: {
    heading: string;
    guidelines: { title: string; text: string }[];
  };
}

export interface DashboardStats {
  totalRevenue: Currency;
  revenueDelta: string;
  activeOrdersCount: number;
  activeOrdersDelta: string;
  totalCustomersCount: number;
  totalCustomersDelta: string;
  masterpiecesCount: number;
  masterpiecesDelta: string;
}

export type StockMovementReason = 'initial' | 'restock' | 'sale' | 'adjustment' | 'return' | 'damaged';

export interface StockMovement {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  changeQty: number; // + or -
  stockBefore: number;
  stockAfter: number;
  reason: StockMovementReason;
  orderId?: string;
  note?: string;
  adminUid: string;
  adminName: string;
  createdAt: string;
}
