import {
  Category,
  Product,
  Order,
  Customer,
  Coupon,
  SeasonalOffer,
  HeroSlide,
  AdminUser,
  JournalArticle,
  SiteContent,
} from './types';
import {
  seedCategories,
  seedProducts,
  seedOrders,
  seedCustomers,
  seedCoupons,
  seedOffers,
  seedHeroSlides,
  seedAdminUsers,
  seedJournalArticles,
  seedSiteContent,
} from './seed';

const STORAGE_KEY = 'adi_parva_store_v1';

export interface StoreData {
  categories: Category[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
  coupons: Coupon[];
  offers: SeasonalOffer[];
  heroSlides: HeroSlide[];
  adminUsers: AdminUser[];
  journalArticles: JournalArticle[];
  siteContent: SiteContent;
}

export function getInitialSeedData(): StoreData {
  return {
    categories: [...seedCategories],
    products: [...seedProducts],
    orders: [...seedOrders],
    customers: [...seedCustomers],
    coupons: [...seedCoupons],
    offers: [...seedOffers],
    heroSlides: [...seedHeroSlides],
    adminUsers: [...seedAdminUsers],
    journalArticles: [...seedJournalArticles],
    siteContent: { ...seedSiteContent },
  };
}

export function getStoreData(): StoreData {
  if (typeof window === 'undefined') {
    return getInitialSeedData();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSeedData();
      saveStoreData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error('Failed to read localStorage store, fallback to seed:', err);
    return getInitialSeedData();
  }
}

export function saveStoreData(data: StoreData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage store:', err);
  }
}

export function resetStore(): StoreData {
  const fresh = getInitialSeedData();
  saveStoreData(fresh);
  return fresh;
}
