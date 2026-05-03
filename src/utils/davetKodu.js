/** Toptancıların birbirine vereceği davet kodu (okunaklı, I/O/1/0 yok). */
export function randomDavetKodu() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr, (x) => chars[x % chars.length]).join('');
}
