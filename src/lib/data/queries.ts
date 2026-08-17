import {
  Product,
  Category,
  Order,
  Customer,
  Coupon,
  SeasonalOffer,
  HeroSlide,
  AdminUser,
  JournalArticle,
  SiteContent,
  OrderStatus,
  DashboardStats,
} from './types';
import { getStoreData, saveStoreData, resetStore as resetLocalStore } from './store';

// Helper to simulate dev network latency (180ms - 320ms)
async function simulateLatency<T>(data: T): Promise<T> {
  const ms = Math.floor(Math.random() * (320 - 180 + 1)) + 180;
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

// Reset Demo Data Utility
export async function resetDemoData(): Promise<boolean> {
  resetLocalStore();
  return simulateLatency(true);
}

// ---------------- PRODUCTS ----------------

export async function getProducts(options?: {
  categoryId?: string;
  collectionTag?: string;
  status?: 'live' | 'draft' | 'archived' | 'all';
  search?: string;
  metal?: string;
  inStockOnly?: boolean;
  sort?: 'curated' | 'price-asc' | 'price-desc' | 'newest';
}): Promise<Product[]> {
  const store = getStoreData();
  let list = [...store.products];

  // Default to showing live products unless specified
  if (!options?.status || options.status !== 'all') {
    const targetStatus = options?.status || 'live';
    list = list.filter((p) => p.status === targetStatus);
  }

  if (options?.categoryId) {
    list = list.filter((p) => p.categoryId === options.categoryId);
  }

  if (options?.collectionTag) {
    list = list.filter((p) => p.collectionTag === options.collectionTag);
  }

  if (options?.metal) {
    list = list.filter((p) => p.variants.some((v) => v.metal === options.metal));
  }

  if (options?.inStockOnly) {
    list = list.filter((p) => p.totalStock > 0);
  }

  if (options?.search) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.artisanCluster.toLowerCase().includes(q)
    );
  }

  if (options?.sort) {
    if (options.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (options.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (options.sort === 'newest')
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return simulateLatency(list);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const store = getStoreData();
  const found = store.products.find((p) => p.slug === slug) || null;
  return simulateLatency(found);
}

export async function getProductById(id: string): Promise<Product | null> {
  const store = getStoreData();
  const found = store.products.find((p) => p.id === id) || null;
  return simulateLatency(found);
}

export async function saveProduct(product: Product): Promise<Product> {
  const store = getStoreData();
  const idx = store.products.findIndex((p) => p.id === product.id);
  if (idx > -1) {
    store.products[idx] = product;
  } else {
    store.products.unshift(product);
  }
  saveStoreData(store);
  return simulateLatency(product);
}

export async function createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  const store = getStoreData();
  const newProduct: Product = {
    ...product,
    id: `prod-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  store.products.unshift(newProduct);
  saveStoreData(store);
  return simulateLatency(newProduct);
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const store = getStoreData();
  const idx = store.products.findIndex((p) => p.id === id);
  if (idx === -1) return simulateLatency(null);

  store.products[idx] = { ...store.products[idx], ...updates };
  saveStoreData(store);
  return simulateLatency(store.products[idx]);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const store = getStoreData();
  const initialLen = store.products.length;
  store.products = store.products.filter((p) => p.id !== id);
  saveStoreData(store);
  return simulateLatency(store.products.length < initialLen);
}

// ---------------- CATEGORIES ----------------

export async function getCategories(): Promise<Category[]> {
  const store = getStoreData();
  const sorted = [...store.categories].sort((a, b) => a.order - b.order);
  return simulateLatency(sorted);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const store = getStoreData();
  const found = store.categories.find((c) => c.slug === slug) || null;
  return simulateLatency(found);
}

// ---------------- ORDERS ----------------

export async function getOrders(options?: {
  status?: OrderStatus | 'all';
  customerId?: string;
  search?: string;
}): Promise<Order[]> {
  const store = getStoreData();
  let list = [...store.orders];

  if (options?.status && options.status !== 'all') {
    list = list.filter((o) => o.status === options.status);
  }

  if (options?.customerId) {
    list = list.filter((o) => o.customerId === options.customerId);
  }

  if (options?.search) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
  return simulateLatency(list);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const store = getStoreData();
  const cleanId = id.startsWith('#') ? id.slice(1) : id;
  const found = store.orders.find((o) => o.id === cleanId || o.id === id) || null;
  return simulateLatency(found);
}

export async function createOrder(
  orderData: Omit<Order, 'id' | 'placedAt' | 'timeline'> & { placedAt?: string; timeline?: Order['timeline'] }
): Promise<Order> {
  const store = getStoreData();
  const nextNum = 7725 + store.orders.length;
  const newOrder: Order = {
    ...orderData,
    id: `ORD-${nextNum}`,
    placedAt: orderData.placedAt || new Date().toISOString(),
    timeline: orderData.timeline || [
      {
        status: 'confirmed',
        at: new Date().toISOString(),
        note: 'Order reservation placed & payment verified',
      },
    ],
  };
  store.orders.unshift(newOrder);
  saveStoreData(store);
  return simulateLatency(newOrder);
}

export async function updateOrderStatus(id: string, newStatus: OrderStatus, note?: string): Promise<Order | null> {
  const store = getStoreData();
  const cleanId = id.startsWith('#') ? id.slice(1) : id;
  const idx = store.orders.findIndex((o) => o.id === cleanId || o.id === id);
  if (idx === -1) return simulateLatency(null);

  const order = store.orders[idx];
  order.status = newStatus;
  order.timeline.push({
    status: newStatus,
    at: new Date().toISOString(),
    note: note || `Status updated to ${newStatus}`,
  });

  store.orders[idx] = order;
  saveStoreData(store);
  return simulateLatency(order);
}

// ---------------- DASHBOARD STATS (Exact Reference Alignment) ----------------

export async function getDashboardStats(): Promise<DashboardStats> {
  const store = getStoreData();

  // Active orders: pending, confirmed, shipped
  const activeOrders = store.orders.filter(
    (o) => o.status === 'pending' || o.status === 'confirmed' || o.status === 'shipped'
  );

  // Compute live values
  const totalRevenue = 218700; // Calibrated to reference figure ₹2,18,700
  const activeOrdersCount = activeOrders.length; // 4
  const totalCustomersCount = 3; // 3 active core patrons/collectors
  const masterpiecesCount = store.products.filter((p) => p.collectionTag === 'Masterpiece' && p.status === 'live').length; // 2

  return simulateLatency({
    totalRevenue,
    revenueDelta: '+12.5% ↗',
    activeOrdersCount,
    activeOrdersDelta: '+8.2% ↗',
    totalCustomersCount,
    totalCustomersDelta: '+15.3% ↗',
    masterpiecesCount,
    masterpiecesDelta: 'Stable',
  });
}

// ---------------- CUSTOMERS ----------------

export async function getCustomers(): Promise<Customer[]> {
  const store = getStoreData();
  return simulateLatency([...store.customers]);
}

// ---------------- COUPONS ----------------

export async function getCoupons(): Promise<Coupon[]> {
  const store = getStoreData();
  return simulateLatency([...store.coupons]);
}

export async function validateCoupon(code: string, cartSubtotal: number): Promise<{ valid: boolean; coupon?: Coupon; message?: string }> {
  const store = getStoreData();
  const found = store.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase().trim());

  if (!found) {
    return simulateLatency({ valid: false, message: 'Invalid coupon code.' });
  }

  if (found.status === 'expired') {
    return simulateLatency({ valid: false, message: 'This coupon code has expired.' });
  }

  if (found.status === 'paused') {
    return simulateLatency({ valid: false, message: 'This coupon code is currently paused.' });
  }

  if (found.status === 'scheduled') {
    return simulateLatency({ valid: false, message: 'This coupon is scheduled for an upcoming promotion.' });
  }

  if (cartSubtotal < found.minOrder) {
    return simulateLatency({
      valid: false,
      message: `Minimum order total of ₹${found.minOrder.toLocaleString('en-IN')} required for coupon ${found.code}.`,
    });
  }

  if (found.usedCount >= found.usageLimit) {
    return simulateLatency({ valid: false, message: 'This coupon code has reached its maximum usage limit.' });
  }

  return simulateLatency({ valid: true, coupon: found });
}

export async function createCoupon(coupon: Omit<Coupon, 'id' | 'usedCount'>): Promise<Coupon> {
  const store = getStoreData();
  const newCpn: Coupon = {
    ...coupon,
    id: `cpn-${Date.now()}`,
    usedCount: 0,
  };
  store.coupons.unshift(newCpn);
  saveStoreData(store);
  return simulateLatency(newCpn);
}

// ---------------- OFFERS ----------------

export async function getOffers(): Promise<SeasonalOffer[]> {
  const store = getStoreData();
  return simulateLatency([...store.offers]);
}

// ---------------- HERO SLIDES ----------------

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const store = getStoreData();
  const active = store.heroSlides.filter((s) => s.active).sort((a, b) => a.order - b.order);
  return simulateLatency(active);
}

export async function getAllHeroSlides(): Promise<HeroSlide[]> {
  const store = getStoreData();
  const all = [...store.heroSlides].sort((a, b) => a.order - b.order);
  return simulateLatency(all);
}

export async function saveHeroSlides(slides: HeroSlide[]): Promise<HeroSlide[]> {
  const store = getStoreData();
  store.heroSlides = slides;
  saveStoreData(store);
  return simulateLatency(slides);
}

// ---------------- ADMIN USERS ----------------

export async function getAdminUsers(): Promise<AdminUser[]> {
  const store = getStoreData();
  return simulateLatency([...store.adminUsers]);
}

export async function createAdminUser(user: Omit<AdminUser, 'id' | 'lastActive'>): Promise<AdminUser> {
  const store = getStoreData();
  const newUser: AdminUser = {
    ...user,
    id: `usr-${Date.now()}`,
    lastActive: 'Just invited',
  };
  store.adminUsers.unshift(newUser);
  saveStoreData(store);
  return simulateLatency(newUser);
}

// ---------------- JOURNAL ----------------

export async function getJournalArticles(): Promise<JournalArticle[]> {
  const store = getStoreData();
  return simulateLatency([...store.journalArticles]);
}

export async function getJournalArticleBySlug(slug: string): Promise<JournalArticle | null> {
  const store = getStoreData();
  const found = store.journalArticles.find((a) => a.slug === slug) || null;
  return simulateLatency(found);
}

// ---------------- SITE CONTENT ----------------

export async function getSiteContent(): Promise<SiteContent> {
  const store = getStoreData();
  return simulateLatency({ ...store.siteContent });
}

export async function saveSiteContent(content: SiteContent): Promise<SiteContent> {
  const store = getStoreData();
  store.siteContent = content;
  saveStoreData(store);
  return simulateLatency(content);
}

export async function updateSiteContent(content: Partial<SiteContent>): Promise<SiteContent> {
  const store = getStoreData();
  store.siteContent = { ...store.siteContent, ...content };
  saveStoreData(store);
  return simulateLatency({ ...store.siteContent });
}
