const TOPTANCI_WA = import.meta.env.VITE_TOPTANCI_WA_NUMBER || '905000000000';
const TOPTANCI_SITE = import.meta.env.VITE_TOPTANCI_SITE_URL || 'https://toptanci-site.com';

function cleanWaNumber(value) {
  return String(value || '').replace(/[^\d]/g, '');
}

export function buildWALink(order) {
  const c = order.customer_info || {};
  const toptanci = order.toptanci_info || {};
  const waNumber = cleanWaNumber(toptanci.whatsapp) || cleanWaNumber(TOPTANCI_WA);
  const siteUrl = toptanci.siteUrl || TOPTANCI_SITE;
  const msg = [
    `Merhaba, ben ${c.shop_name || ''}'dan ${c.contact_name || ''}.`,
    `Az once sistemden siparis gectim.`,
    `Siparis No: #${order.id}`,
    `Toplam: ${order.total_pairs} cift | Tutar: ${order.total_amount} TL`,
    `Sehir: ${c.city || ''}`,
    `Toptanci sitemiz: ${siteUrl}`,
    `Bilginize, iyi gunler.`,
  ].join('%0A');
  return `https://wa.me/${waNumber}?text=${msg}`;
}
