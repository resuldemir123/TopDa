import { useState } from 'react';
import { updateOrderStatus } from '../../services/firestore';
import { buildWALink } from '../../services/whatsapp';
import { formatSizesSummary } from '../../utils/cartMath';

const statusOptions = [
  ['pending', 'Bekliyor'],
  ['confirmed', 'Onaylandi'],
  ['preparing', 'Hazirlaniyor'],
  ['completed', 'Tamamlandi'],
  ['cancelled', 'Iptal'],
];

function dateText(value) {
  const date = value?.toDate?.() || null;
  if (!date) return 'Tarih yok';
  return date.toLocaleString('tr-TR');
}

export default function OrderCard({ order }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const customer = order.customer_info || {};

  async function handleStatusChange(e) {
    const nextStatus = e.target.value;
    setBusy(true);
    setError('');
    try {
      await updateOrderStatus(order.id, nextStatus);
    } catch {
      setError('Durum guncellenemedi.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="ui-card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            #{order.id}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            {customer.shop_name || 'Dukkan adi yok'}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {customer.contact_name || 'Musteri yok'} · {customer.phone || 'Telefon yok'} · {customer.city || 'Sehir yok'}
          </p>
          <p className="mt-1 text-xs text-slate-500">{dateText(order.created_at)}</p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <select
            value={order.status || 'pending'}
            onChange={handleStatusChange}
            disabled={busy}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {statusOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <a
            href={buildWALink(order)}
            target="_blank"
            rel="noopener noreferrer"
            className="ui-btn-primary"
          >
            WhatsApp
          </a>
        </div>
      </div>

      <div className="px-5 py-4">
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
          {(order.items || []).map((item, index) => (
            <li key={`${item.productId}-${item.color}-${index}`} className="px-4 py-3 text-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium text-slate-900">
                  {item.productName} {item.productCode ? `(${item.productCode})` : ''}
                </span>
                <span className="text-slate-600">
                  {item.color} · {formatSizesSummary(item.sizes)}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {customer.note && (
          <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Not: {customer.note}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-600">
            Toplam: <strong className="text-slate-900">{order.total_pairs || 0} cift</strong>
          </p>
          <p className="text-base font-semibold tabular-nums text-emerald-800">
            {Number(order.total_amount || 0).toLocaleString('tr-TR')} TL
          </p>
        </div>
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      </div>
    </article>
  );
}
