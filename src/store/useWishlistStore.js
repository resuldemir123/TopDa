import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Listede tutulan ürün özeti (detay + sepet için yönlendirme) */
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      add: (entry) => {
        const { productId } = entry;
        if (!productId) return;
        if (get().items.some((i) => i.productId === productId)) return;
        set((s) => ({ items: [...s.items, { ...entry, addedAt: Date.now() }] }));
      },
      remove: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      toggle: (entry) => {
        const { productId } = entry;
        if (get().items.some((i) => i.productId === productId)) {
          get().remove(productId);
        } else {
          get().add(entry);
        }
      },
      has: (productId) => get().items.some((i) => i.productId === productId),
    }),
    { name: 'wishlist-storage', partialize: (state) => ({ items: state.items }) }
  )
);
