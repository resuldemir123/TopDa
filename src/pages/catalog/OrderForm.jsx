import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createOrder } from '../../services/firestore';
import { useCartStore } from '../../store/useCartStore';
import { cartItemsForToptanci } from '../../utils/cartScope';

const emptyForm = {
  shop_name: '',
  contact_name: '',
  phone: '',
  city: '',
  note: '',
};

export default function OrderForm() {
  const navigate = useNavigate();
  const { toptanciId } = useParams();
  const basePath = toptanciId ? `/toptanci/${toptanciId}` : '/katalog';
  const allOrderItems = useCartStore((s) => s.items);
  const items = useMemo(() => cartItemsForToptanci(allOrderItems, toptanciId), [allOrderItems, toptanciId]);
  const totalPairs = useCartStore((s) =>
    toptanciId ? s.getTotalPairsForToptanci(toptanciId) : s.getTotalPairs()
  );
  const totalAmount = useCartStore((s) =>
    toptanciId ? s.getTotalAmountForToptanci(toptanciId) : s.getTotalAmount()
  );
  const clearCartForToptanci = useCartStore((s) => s.clearCartForToptanci);
  const clearCart = useCartStore((s) => s.clearCart);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = items.length > 0 && !busy;

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) {
      setError('Siparis vermek icin sepete en az bir urun ekleyin.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const cleanCustomer = {
        shop_name: form.shop_name.trim(),
        contact_name: form.contact_name.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        note: form.note.trim(),
      };
      const orderToptanciId =
        String(toptanciId || '').trim() || items.find((item) => item.toptanciId)?.toptanciId || '';
      const orderId = await createOrder({
        customer: cleanCustomer,
        items,
        totalPairs,
        totalAmount,
        toptanciId: orderToptanciId,
      });
      if (String(toptanciId || '').trim()) clearCartForToptanci(toptanciId);
      else if (orderToptanciId) clearCartForToptanci(orderToptanciId);
      else clearCart();
      navigate(`${basePath}/ozet?id=${encodeURIComponent(orderId)}`, {
        state: {
          order: {
            id: orderId,
            customer_info: cleanCustomer,
            items,
            total_pairs: totalPairs,
            total_amount: totalAmount,
          },
        },
      });
    } catch (err) {
      setError(
        err?.code === 'permission-denied'
          ? 'Siparis kaydedilemedi. Firestore yazma iznini kontrol edin.'
          : 'Siparis kaydedilemedi. Baglantinizi kontrol edip tekrar deneyin.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="ui-card border-emerald-100/80 ring-1 ring-emerald-50">
      <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 to-white px-5 py-5 sm:px-6">
        <h2 className="text-lg font-bold text-slate-900">Siparişi tamamlayın</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          İşletme ve iletişim bilgilerinizi girin; siparişiniz başarıyla oluşturulacaktır.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-5 px-5 py-6 sm:grid-cols-2 sm:px-6">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Dukkan adi</span>
          <input
            type="text"
            value={form.shop_name}
            onChange={(e) => updateField('shop_name', e.target.value)}
            className="ui-input"
            placeholder="Ornek Ayakkabi"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Musteri adi</span>
          <input
            type="text"
            value={form.contact_name}
            onChange={(e) => updateField('contact_name', e.target.value)}
            className="ui-input"
            placeholder="Ad Soyad"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Telefon</span>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="ui-input"
            placeholder="05XX XXX XX XX"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Sehir</span>
          <input
            type="text"
            value={form.city}
            onChange={(e) => updateField('city', e.target.value)}
            className="ui-input"
            placeholder="Istanbul"
            required
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Not</span>
          <textarea
            value={form.note}
            onChange={(e) => updateField('note', e.target.value)}
            className="ui-input min-h-28 resize-y"
            placeholder="Teslimat veya siparis notu"
          />
        </label>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 sm:col-span-2">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Kaydedilecek toplam: <strong className="text-slate-900">{totalPairs} cift</strong>
          </p>
          <button
            type="submit"
            disabled={!canSubmit}
            className="ui-btn-primary disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:bg-slate-300"
          >
            {busy ? 'Kaydediliyor...' : 'Siparisi kaydet'}
          </button>
        </div>
      </form>
    </section>
  );
}
