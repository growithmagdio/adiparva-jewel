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

// Helper to return data instantly (0ms latency for ultra-fast page transitions)
async function simulateLatency<T>(data: T): Promise<T> {
  return Promise.resolve(data);
}

// Reset Demo Data Utility
export async function resetDemoData(): Promise<boolean> {
  resetLocalStore();
  return simulateLatency(true);
}

// ---------------- PRODUCTS ----------------

export async function getProducts(options?: {
  categoryId?: string;
  categoryIds?: string[];
  collectionTag?: string;
  status?: 'live' | 'draft' | 'archived' | 'all';
  search?: string;
  metal?: string;
  stone?: string;
  occasion?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sort?: 'curated' | 'price-asc' | 'price-desc' | 'newest' | 'latest' | 'best-selling';
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

  if (options?.categoryIds && options.categoryIds.length > 0) {
    list = list.filter((p) => options.categoryIds!.includes(p.categoryId));
  }

  if (options?.collectionTag) {
    list = list.filter((p) => p.collectionTag === options.collectionTag);
  }

  if (options?.metal) {
    const targetMetal = options.metal.toLowerCase();
    list = list.filter((p) => 
      p.baseMetal?.toLowerCase().includes(targetMetal) ||
      p.plating?.toLowerCase().includes(targetMetal) ||
      p.variants.some((v) => v.metal.toLowerCase().includes(targetMetal))
    );
  }

  if (options?.stone) {
    const targetStone = options.stone.toLowerCase();
    list = list.filter((p) => 
      p.stones?.some((s) => s.toLowerCase().includes(targetStone)) ||
      p.specs.some((spec) => spec.value.toLowerCase().includes(targetStone))
    );
  }

  if (options?.occasion) {
    const targetOccasion = options.occasion.toLowerCase();
    list = list.filter((p) => 
      p.occasion?.some((o) => o.toLowerCase().includes(targetOccasion))
    );
  }

  if (options?.minPrice !== undefined) {
    list = list.filter((p) => p.price >= options.minPrice!);
  }

  if (options?.maxPrice !== undefined) {
    list = list.filter((p) => p.price <= options.maxPrice!);
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
    if (options.sort === 'newest' || options.sort === 'latest')
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (options.sort === 'best-selling')
      list.sort((a, b) => b.reviewCount - a.reviewCount);
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

// ---------------- CATEGORIES ----------------

export async function getCategories(): Promise<Category[]> {
  const store = getStoreData();
  return simulateLatency(store.categories);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const store = getStoreData();
  const found = store.categories.find((c) => c.slug === slug) || null;
  return simulateLatency(found);
}

// ---------------- ORDERS ----------------

export async function getOrders(): Promise<Order[]> {
  const store = getStoreData();
  return simulateLatency(store.orders);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const store = getStoreData();
  const found = store.orders.find((o) => o.id === id) || null;
  return simulateLatency(found);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note: string
): Promise<Order | null> {
  const store = getStoreData();
  const order = store.orders.find((o) => o.id === orderId);
  if (!order) return simulateLatency(null);

  order.status = status;
  order.timeline.push({
    status,
    at: new Date().toISOString(),
    note,
  });

  saveStoreData(store);
  return simulateLatency(order);
}

export async function createOrder(orderData: Omit<Order, 'id' | 'placedAt' | 'expectedBy' | 'timeline' | 'status'>): Promise<Order> {
  const store = getStoreData();
  const now = new Date();
  const expected = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days delivery
  
  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder: Order = {
    ...orderData,
    id: orderId,
    status: 'confirmed',
    placedAt: now.toISOString(),
    expectedBy: expected.toISOString(),
    timeline: [
      {
        status: 'confirmed',
        at: now.toISOString(),
        note: 'Order confirmed and registered with the atelier.',
      },
    ],
  };

  store.orders.unshift(newOrder);
  saveStoreData(store);
  return simulateLatency(newOrder);
}

// ---------------- CUSTOMERS ----------------

export async function getCustomers(): Promise<Customer[]> {
  const store = getStoreData();
  return simulateLatency(store.customers);
}

// ---------------- COUPONS ----------------

export async function getCoupons(): Promise<Coupon[]> {
  const store = getStoreData();
  return simulateLatency(store.coupons);
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{ valid: boolean; discount: number; coupon?: Coupon; message?: string }> {
  const store = getStoreData();
  const coupon = store.coupons.find(
    (c) => c.code.toLowerCase() === code.toLowerCase().trim()
  );

  if (!coupon) {
    return simulateLatency({ valid: false, discount: 0, message: 'Invalid coupon code.' });
  }

  if (coupon.status !== 'active') {
    return simulateLatency({ valid: false, discount: 0, message: 'This coupon has expired or is paused.' });
  }

  if (subtotal < coupon.minOrder) {
    return simulateLatency({
      valid: false,
      discount: 0,
      message: `Minimum order amount of ₹${coupon.minOrder.toLocaleString('en-IN')} required.`,
    });
  }

  let discount = 0;
  if (coupon.type === 'percent') {
    discount = Math.round((subtotal * coupon.value) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.value;
  }

  return simulateLatency({ valid: true, discount, coupon, message: 'Coupon applied successfully.' });
}

// ---------------- OFFERS ----------------

export async function getSeasonalOffers(): Promise<SeasonalOffer[]> {
  const store = getStoreData();
  return simulateLatency(store.offers);
}

export async function getOffers(): Promise<SeasonalOffer[]> {
  return getSeasonalOffers();
}

// ---------------- HERO SLIDES ----------------

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const store = getStoreData();
  return simulateLatency(store.heroSlides);
}

export async function saveHeroSlides(slides: HeroSlide[]): Promise<HeroSlide[]> {
  const store = getStoreData();
  store.heroSlides = slides;
  saveStoreData(store);
  return simulateLatency(store.heroSlides);
}

// ---------------- ADMIN USERS ----------------

export async function getAdminUsers(): Promise<AdminUser[]> {
  const store = getStoreData();
  return simulateLatency(store.adminUsers);
}

// ---------------- CONTENT ----------------

export async function getSiteContent(): Promise<SiteContent> {
  const store = getStoreData();
  return simulateLatency(store.siteContent);
}

export async function saveSiteContent(content: SiteContent): Promise<SiteContent> {
  const store = getStoreData();
  store.siteContent = content;
  saveStoreData(store);
  return simulateLatency(store.siteContent);
}

// ---------------- JOURNAL ----------------

export async function getJournalArticles(): Promise<JournalArticle[]> {
  const store = getStoreData();
  return simulateLatency(store.journalArticles);
}

export async function getJournalArticleBySlug(slug: string): Promise<JournalArticle | null> {
  const store = getStoreData();
  const article = store.journalArticles.find((j: JournalArticle) => j.slug === slug) || null;
  return simulateLatency(article);
}

// ---------------- DASHBOARD STATS ----------------

export async function getDashboardStats(): Promise<DashboardStats> {
  const store = getStoreData();
  const totalRevenue = store.orders.reduce((sum, o) => sum + o.total, 0);
  const activeOrdersCount = store.orders.filter((o) =>
    ['pending', 'confirmed', 'shipped'].includes(o.status)
  ).length;

  return simulateLatency({
    totalRevenue,
    revenueDelta: '+14.2%',
    activeOrdersCount,
    activeOrdersDelta: '+3 orders',
    totalCustomersCount: store.customers.length,
    totalCustomersDelta: '+8 total',
    masterpiecesCount: store.products.filter((p) => p.collectionTag === 'Masterpiece').length,
    masterpiecesDelta: 'Constant',
  });
}
