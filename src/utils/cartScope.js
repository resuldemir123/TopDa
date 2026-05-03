/** Sepet satırlarını URL'deki toptancıya göre filtreler (store ile aynı mantık). */
export function cartItemsForToptanci(allItems, toptanciId) {
  const id = String(toptanciId || '').trim();
  const list = Array.isArray(allItems) ? allItems : [];
  if (!id) return list;
  return list.filter((i) => String(i.toptanciId || '').trim() === id);
}
