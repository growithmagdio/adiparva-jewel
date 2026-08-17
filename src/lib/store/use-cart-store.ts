'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  variantLabel: string;
}

interface CartStoreState {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void;
  updateQty: (productId: string, variantId: string, qty: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [
        {
          productId: 'prod-maharani-necklace',
          variantId: 'var-maharani-1',
          name: 'Maharani Temple Necklace',
          image: '/images/products/maharani-temple-necklace-1.jpg',
          price: 45000,
          qty: 1,
          variantLabel: '22K Antique Gold, 16 inch',
        },
      ],
      isCartOpen: false,
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      addItem: (newItem) => {
        const currentItems = get().items;
        const existingIdx = currentItems.findIndex(
          (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
        );

        const addQty = newItem.qty || 1;

        if (existingIdx > -1) {
          const updated = [...currentItems];
          updated[existingIdx].qty += addQty;
          set({ items: updated, isCartOpen: true });
        } else {
          set({
            items: [...currentItems, { ...newItem, qty: addQty }],
            isCartOpen: true,
          });
        }
      },
      updateQty: (productId, variantId, qty) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, qty: Math.max(1, qty) }
              : item
          ),
        }));
      },
      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.variantId === variantId)
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'adi_parva_cart_v1',
    }
  )
);
