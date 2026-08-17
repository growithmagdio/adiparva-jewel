'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStoreState {
  wishlistProductIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStoreState>()(
  persist(
    (set, get) => ({
      wishlistProductIds: ['prod-maharani-necklace', 'prod-peacock-jhumkas'],
      toggleWishlist: (productId) => {
        const current = get().wishlistProductIds;
        if (current.includes(productId)) {
          set({ wishlistProductIds: current.filter((id) => id !== productId) });
        } else {
          set({ wishlistProductIds: [...current, productId] });
        }
      },
      isInWishlist: (productId) => get().wishlistProductIds.includes(productId),
    }),
    {
      name: 'adi_parva_wishlist_v1',
    }
  )
);
