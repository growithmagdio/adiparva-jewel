import { unstable_cache } from 'next/cache';
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
  StockMovement,
} from './types';
import { getStoreData, saveStoreData, resetStore as resetLocalStore } from './store';
import { db, storage } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { generateServerProductCode } from '@/app/actions/product-code';

// ---------------- RAW UNCACHED QUERIES ----------------

async function fetchProductsRaw(options?: {
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
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  const store = getStoreData();
  let list = [...store.products];

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
    list = list.filter(
      (p) =>
        p.baseMetal?.toLowerCase().includes(targetMetal) ||
        p.plating?.toLowerCase().includes(targetMetal) ||
        p.variants.some((v) => v.metal.toLowerCase().includes(targetMetal))
    );
  }

  if (options?.stone) {
    const targetStone = options.stone.toLowerCase();
    list = list.filter(
      (p) =>
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
        p.artisanCluster.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q)
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

  // Targeted pagination / limit
  const offset = options?.offset || 0;
  if (options?.limit) {
    list = list.slice(offset, offset + options.limit);
  }

  return list;
}

async function fetchProductBySlugRaw(slug: string): Promise<Product | null> {
  const store = getStoreData();
  return store.products.find((p) => p.slug === slug) || null;
}

async function fetchCategoriesRaw(): Promise<Category[]> {
  const store = getStoreData();
  let list = [...store.categories];

  list = list.map((cat) => {
    const count = store.products.filter((p) => p.categoryId === cat.id && p.status === 'live').length;
    return {
      ...cat,
      image: cat.image || cat.heroImage || `/images/categories/${cat.slug}.jpg`,
      sortOrder: cat.sortOrder !== undefined ? cat.sortOrder : cat.order || 1,
      isActive: cat.isActive !== false,
      pieceCount: count,
    };
  });

  list.sort((a, b) => (a.sortOrder || 1) - (b.sortOrder || 1));
  return list;
}

// ---------------- CACHED PUBLIC QUERIES (5-Minute Revalidation) ----------------

const fetchProductsCached = unstable_cache(
  async (options?: Parameters<typeof fetchProductsRaw>[0]) => fetchProductsRaw(options),
  ['products-list'],
  { revalidate: 300, tags: ['products'] }
);

export async function getProducts(options?: Parameters<typeof fetchProductsRaw>[0]): Promise<Product[]> {
  if (typeof window !== 'undefined') {
    return fetchProductsRaw(options);
  }
  try {
    return await fetchProductsCached(options);
  } catch (err) {
    return fetchProductsRaw(options);
  }
}

const fetchProductBySlugCached = unstable_cache(
  async (slug: string) => fetchProductBySlugRaw(slug),
  ['product-by-slug'],
  { revalidate: 300, tags: ['products'] }
);

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (typeof window !== 'undefined') {
    return fetchProductBySlugRaw(slug);
  }
  try {
    return await fetchProductBySlugCached(slug);
  } catch (err) {
    return fetchProductBySlugRaw(slug);
  }
}

const fetchCategoriesCached = unstable_cache(
  async (options?: { activeOnly?: boolean }) => {
    const list = await fetchCategoriesRaw();
    if (options?.activeOnly) {
      return list.filter((c) => c.isActive && c.pieceCount > 0);
    }
    return list;
  },
  ['categories-list'],
  { revalidate: 300, tags: ['categories'] }
);

export async function getCategories(options?: { activeOnly?: boolean }): Promise<Category[]> {
  if (typeof window !== 'undefined') {
    const list = await fetchCategoriesRaw();
    if (options?.activeOnly) {
      return list.filter((c) => c.isActive && c.pieceCount > 0);
    }
    return list;
  }
  try {
    return await fetchCategoriesCached(options);
  } catch (err) {
    const list = await fetchCategoriesRaw();
    if (options?.activeOnly) {
      return list.filter((c) => c.isActive && c.pieceCount > 0);
    }
    return list;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const store = getStoreData();
  return store.products.find((p) => p.id === id) || null;
}

export async function saveProduct(product: Product): Promise<Product> {
  const store = getStoreData();

  if (!product.code) {
    product.code = await generateServerProductCode();
  }

  const idx = store.products.findIndex((p) => p.id === product.id);
  if (idx > -1) {
    store.products[idx] = product;
  } else {
    store.products.unshift(product);
  }
  saveStoreData(store);

  try {
    const prodRef = doc(db, 'products', product.id);
    await setDoc(prodRef, product, { merge: true });
  } catch (err) {
    console.warn('Firestore sync skipped for saveProduct:', err);
  }

  return product;
}

export async function createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  const store = getStoreData();

  const code = product.code || (await generateServerProductCode());
  const newId = `prod-${Date.now()}`;
  const now = new Date().toISOString();

  const newProduct: Product = {
    ...product,
    id: newId,
    code,
    createdAt: now,
  };

  store.products.unshift(newProduct);

  const catIdx = store.categories.findIndex((c) => c.id === product.categoryId);
  if (catIdx > -1) {
    store.categories[catIdx].pieceCount = (store.categories[catIdx].pieceCount || 0) + 1;
  }

  saveStoreData(store);

  try {
    await setDoc(doc(db, 'products', newId), newProduct);
  } catch (err) {
    console.warn('Firestore sync skipped for createProduct:', err);
  }

  return newProduct;
}

export async function deleteProduct(productId: string): Promise<{ success: boolean; archived: boolean; message: string }> {
  const store = getStoreData();
  const prod = store.products.find((p) => p.id === productId);

  if (!prod) {
    return { success: false, archived: false, message: 'Product not found.' };
  }

  const isInPastOrders = store.orders.some((o) =>
    o.items.some((item) => item.productId === productId)
  );

  if (isInPastOrders) {
    prod.status = 'archived';
    saveStoreData(store);

    try {
      await updateDoc(doc(db, 'products', productId), { status: 'archived' });
    } catch (e) {}

    return {
      success: true,
      archived: true,
      message: 'Product appears in past orders and has been safely archived instead of deleted.',
    };
  }

  store.products = store.products.filter((p) => p.id !== productId);

  const cat = store.categories.find((c) => c.id === prod.categoryId);
  if (cat && cat.pieceCount > 0) {
    cat.pieceCount -= 1;
  }

  saveStoreData(store);

  try {
    for (const imgUrl of prod.images || []) {
      if (imgUrl.startsWith('gs://') || imgUrl.includes('firebasestorage')) {
        const imageRef = ref(storage, imgUrl);
        await deleteObject(imageRef).catch(() => {});
      }
    }
    await deleteDoc(doc(db, 'products', productId));
  } catch (e) {}

  return {
    success: true,
    archived: false,
    message: 'Product deleted permanently.',
  };
}

// ---------------- CATEGORIES ----------------

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) || null;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((c) => c.id === id) || null;
}

// ---------------- ORDERS ----------------

export async function getOrders(): Promise<Order[]> {
  const store = getStoreData();
  return store.orders;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const store = getStoreData();
  return store.orders.find((o) => o.id === id) || null;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note: string
): Promise<Order | null> {
  const store = getStoreData();
  const order = store.orders.find((o) => o.id === orderId);
  if (!order) return null;

  order.status = status;
  order.timeline.push({
    status,
    at: new Date().toISOString(),
    note,
  });

  saveStoreData(store);
  return order;
}

export async function createOrder(orderData: Omit<Order, 'id' | 'placedAt' | 'expectedBy' | 'timeline' | 'status'>): Promise<Order> {
  const store = getStoreData();
  const now = new Date();
  const expected = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

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
  return newOrder;
}

// ---------------- OTHER QUERIES ----------------

export async function getCustomers(): Promise<Customer[]> {
  const store = getStoreData();
  return store.customers;
}

export async function getCoupons(): Promise<Coupon[]> {
  const store = getStoreData();
  return store.coupons;
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
    return { valid: false, discount: 0, message: 'Invalid coupon code.' };
  }

  if (coupon.status !== 'active') {
    return { valid: false, discount: 0, message: 'This coupon has expired or is paused.' };
  }

  if (subtotal < coupon.minOrder) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum order amount of ₹${coupon.minOrder.toLocaleString('en-IN')} required.`,
    };
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

  return { valid: true, discount, coupon, message: 'Coupon applied successfully.' };
}

export async function getSeasonalOffers(): Promise<SeasonalOffer[]> {
  const store = getStoreData();
  return store.offers;
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const store = getStoreData();
  return store.heroSlides;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const store = getStoreData();
  return store.adminUsers;
}

export async function getSiteContent(): Promise<SiteContent> {
  const store = getStoreData();
  return store.siteContent;
}

export async function getJournalArticles(): Promise<JournalArticle[]> {
  const store = getStoreData();
  return store.journalArticles;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const store = getStoreData();
  const totalRevenue = store.orders.reduce((sum, o) => sum + o.total, 0);
  const activeOrdersCount = store.orders.filter((o) =>
    ['pending', 'confirmed', 'shipped'].includes(o.status)
  ).length;

  return {
    totalRevenue,
    revenueDelta: '+14.2%',
    activeOrdersCount,
    activeOrdersDelta: '+3 orders',
    totalCustomersCount: store.customers.length,
    totalCustomersDelta: '+8 total',
    masterpiecesCount: store.products.filter((p) => p.collectionTag === 'Masterpiece').length,
    masterpiecesDelta: 'Constant',
  };
}

// ---------------- ADDITIONAL ADMIN MANAGEMENT MUTATIONS ----------------

export async function createCategory(
  cat: {
    name: string;
    description?: string;
    tagline?: string;
    image?: string;
    heroImage?: string;
    isActive?: boolean;
    sortOrder?: number;
    order?: number;
    slug?: string;
    featured?: boolean;
  }
): Promise<{ category?: Category; error?: string }> {
  const store = getStoreData();
  const id = `cat-${Date.now()}`;
  const slug = cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newCat: Category = {
    id,
    slug,
    name: cat.name,
    tagline: cat.tagline || cat.description || '',
    description: cat.description || '',
    heroImage: cat.heroImage || cat.image || `/images/categories/${slug}.jpg`,
    image: cat.image || cat.heroImage || `/images/categories/${slug}.jpg`,
    pieceCount: 0,
    order: cat.sortOrder || cat.order || store.categories.length + 1,
    sortOrder: cat.sortOrder || cat.order || store.categories.length + 1,
    featured: cat.featured ?? true,
    isActive: cat.isActive !== false,
  };
  store.categories.push(newCat);
  saveStoreData(store);
  return { category: newCat };
}

export async function saveCategory(cat: Category): Promise<Category> {
  const store = getStoreData();
  const idx = store.categories.findIndex((c) => c.id === cat.id);
  if (idx > -1) {
    store.categories[idx] = { ...store.categories[idx], ...cat };
  } else {
    store.categories.push(cat);
  }
  saveStoreData(store);
  return cat;
}

export async function deleteCategory(categoryId: string): Promise<{ success: boolean; message: string }> {
  const store = getStoreData();
  const cat = store.categories.find((c) => c.id === categoryId);
  if (!cat) {
    return { success: false, message: 'Category not found.' };
  }
  const hasProducts = store.products.some((p) => p.categoryId === categoryId && p.status !== 'archived');
  if (hasProducts) {
    return { success: false, message: 'Category contains active products. Move or reassign them first.' };
  }
  store.categories = store.categories.filter((c) => c.id !== categoryId);
  saveStoreData(store);
  return { success: true, message: 'Category deleted successfully.' };
}

export async function moveCategoryProducts(fromCatId: string, toCatId: string): Promise<void> {
  const store = getStoreData();
  let count = 0;
  store.products = store.products.map((p) => {
    if (p.categoryId === fromCatId) {
      count++;
      return { ...p, categoryId: toCatId };
    }
    return p;
  });
  const fromCat = store.categories.find((c) => c.id === fromCatId);
  const toCat = store.categories.find((c) => c.id === toCatId);
  if (fromCat) fromCat.pieceCount = 0;
  if (toCat) toCat.pieceCount = (toCat.pieceCount || 0) + count;
  saveStoreData(store);
}

export async function moveProductsToCategory(productIds: string[], targetCategoryId: string): Promise<void> {
  const store = getStoreData();
  store.products = store.products.map((p) => {
    if (productIds.includes(p.id)) {
      return { ...p, categoryId: targetCategoryId };
    }
    return p;
  });
  store.categories.forEach((cat) => {
    cat.pieceCount = store.products.filter((p) => p.categoryId === cat.id && p.status === 'live').length;
  });
  saveStoreData(store);
}

export async function reorderCategories(categoryIds: string[]): Promise<void> {
  const store = getStoreData();
  categoryIds.forEach((id, index) => {
    const cat = store.categories.find((c) => c.id === id);
    if (cat) {
      cat.order = index + 1;
      cat.sortOrder = index + 1;
    }
  });
  store.categories.sort((a, b) => (a.sortOrder || a.order || 0) - (b.sortOrder || b.order || 0));
  saveStoreData(store);
}

export async function saveSiteContent(content: Partial<SiteContent>): Promise<SiteContent> {
  const store = getStoreData();
  store.siteContent = { ...store.siteContent, ...content };
  saveStoreData(store);
  return store.siteContent;
}

export async function saveHeroSlides(slides: HeroSlide[]): Promise<HeroSlide[]> {
  const store = getStoreData();
  store.heroSlides = slides;
  saveStoreData(store);
  return store.heroSlides;
}

export async function getStockMovements(productId?: string): Promise<StockMovement[]> {
  const store = getStoreData();
  const list = store.stockMovements || [];
  if (productId) {
    return list.filter((m) => m.productId === productId);
  }
  return list;
}

export const getOffers = getSeasonalOffers;

export async function getInventoryStats(): Promise<{
  totalProducts: number;
  totalStockUnits: number;
  lowStockCount: number;
  soldOutCount: number;
}> {
  const store = getStoreData();
  const activeProducts = store.products.filter((p) => p.status !== 'archived');
  const totalProducts = activeProducts.length;
  const totalStockUnits = activeProducts.reduce((sum, p) => sum + p.totalStock, 0);
  const lowStockCount = activeProducts.filter((p) => {
    const threshold = p.lowStockThreshold ?? 3;
    return p.totalStock > 0 && p.totalStock <= threshold;
  }).length;
  const soldOutCount = activeProducts.filter((p) => p.totalStock === 0).length;

  return {
    totalProducts,
    totalStockUnits,
    lowStockCount,
    soldOutCount,
  };
}

export async function resetDemoData(): Promise<void> {
  resetLocalStore();
}

