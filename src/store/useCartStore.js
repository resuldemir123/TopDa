import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mergeSizeMaps, sumSizeQty } from '../utils/cartMath';

function sumPairs(items) {
  return items.reduce((acc, i) => acc + sumSizeQty(i.sizes), 0);
}

function sumAmount(items) {
  return items.reduce((acc, i) => acc + (i.subtotal || 0), 0);
}

function lineSubtotal(unitPrice, sizes) {
  const pairs = sumSizeQty(sizes);
  const price = Number(unitPrice) || 0;
  return pairs * price;
}

function itemsFromState(s) {
  return Array.isArray(s?.items) ? s.items : [];
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      /** Aynı ürün + renk varsa beden adetlerini birleştirir */
      addOrMergeLine: (line) =>
        set((s) => {
          const {
            productId,
            toptanciId,
            productName,
            productCode,
            color,
            colorHex,
            sizes,
            unitPrice,
            image,
          } = line;
          const prevItems = itemsFromState(s);
          const tid = String(toptanciId || '').trim();
          const idx = prevItems.findIndex(
            (i) =>
              i.productId === productId &&
              i.color === color &&
              String(i.toptanciId || '').trim() === tid
          );
          if (idx === -1) {
            const subtotal = lineSubtotal(unitPrice, sizes);
            return {
              items: [
                ...prevItems,
                {
                  productId,
                  toptanciId: tid,
                  productName,
                  productCode: productCode || '',
                  color,
                  colorHex,
                  sizes: { ...sizes },
                  unitPrice,
                  subtotal,
                  image: image || '',
                },
              ],
            };
          }
          const merged = mergeSizeMaps(prevItems[idx].sizes, sizes);
          const subtotal = lineSubtotal(prevItems[idx].unitPrice, merged);
          const items = [...prevItems];
          items[idx] = {
            ...items[idx],
            sizes: merged,
            subtotal,
            image: image || items[idx].image || '',
            productCode: productCode || items[idx].productCode || '',
            toptanciId: tid || items[idx].toptanciId || '',
          };
          return { items };
        }),
      removeItem: (index) =>
        set((s) => {
          const prev = itemsFromState(s);
          if (index < 0 || index >= prev.length) return s;
          return { items: prev.filter((_, idx) => idx !== index) };
        }),
      updateQty: (index, sizes) =>
        set((s) => {
          const items = [...itemsFromState(s)];
          if (!items[index]) return s;
          items[index] = {
            ...items[index],
            sizes: { ...sizes },
            subtotal: lineSubtotal(items[index].unitPrice, sizes),
          };
          return { items };
        }),
      clearCart: () => set({ items: [] }),
      clearCartForToptanci: (toptanciId) =>
        set((s) => {
          const id = String(toptanciId || '').trim();
          if (!id) return s;
          return { items: itemsFromState(s).filter((i) => i.toptanciId !== id) };
        }),
      getTotalPairs: () => sumPairs(itemsFromState(get())),
      getTotalAmount: () => sumAmount(itemsFromState(get())),
      getItemsForToptanci: (toptanciId) => {
        const id = String(toptanciId || '').trim();
        const all = itemsFromState(get());
        if (!id) return all;
        return all.filter((i) => String(i.toptanciId || '').trim() === id);
      },
      getTotalPairsForToptanci: (toptanciId) => sumPairs(get().getItemsForToptanci(toptanciId)),
      getTotalAmountForToptanci: (toptanciId) => sumAmount(get().getItemsForToptanci(toptanciId)),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => {
        const p = persisted && typeof persisted === 'object' ? persisted : {};
        const merged = { ...current, ...p };
        merged.items = Array.isArray(p.items) ? p.items : itemsFromState(current);
        return merged;
      },
    }
  )
);
