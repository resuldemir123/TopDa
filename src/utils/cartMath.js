export function sumSizeQty(sizes) {
  if (!sizes || typeof sizes !== 'object') return 0;
  return Object.values(sizes).reduce((a, n) => a + Number(n || 0), 0);
}

export function formatSizesSummary(sizes) {
  if (!sizes || typeof sizes !== 'object') return '—';
  const parts = Object.entries(sizes)
    .filter(([, q]) => Number(q) > 0)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([sz, q]) => `${sz}×${q}`);
  return parts.length ? parts.join(', ') : '—';
}

export function mergeSizeMaps(a, b) {
  const out = { ...(a || {}) };
  for (const [k, v] of Object.entries(b || {})) {
    const add = Number(v || 0);
    if (add <= 0) continue;
    out[k] = Number(out[k] || 0) + add;
  }
  return out;
}
