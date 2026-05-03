import { useEffect, useState } from 'react';
import { onSnapshot } from 'firebase/firestore';
import OrderCard from './OrderCard';
import { getToptanciProfile, ordersQuery } from '../../services/firestore';
import { useAuthStore } from '../../store/useAuthStore';

export default function OrdersPage() {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [davetKodu, setDavetKodu] = useState('');

  useEffect(() => {
    if (!user?.uid) return;
    let c = false;
    getToptanciProfile(user.uid)
      .then((p) => {
        if (!c && p?.davetKodu) setDavetKodu(String(p.davetKodu));
      })
      .catch(() => {});
    return () => {
      c = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    const q = ordersQuery();
    const unsub = onSnapshot(
      q,
      (snap) => {
        setOrders(
          snap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((order) => order.customer_info && Array.isArray(order.items))
            .sort((a, b) => {
              const da = a.created_at?.toMillis?.() || 0;
              const db = b.created_at?.toMillis?.() || 0;
              return db - da;
            })
        );
        setLoading(false);
      },
      (err) => {
        setError(
          err?.code === 'permission-denied'
            ? 'Siparisleri okuma izni yok. Firestore kurallarini kontrol edin.'
            : err?.code === 'failed-precondition'
            ? 'Firestore indeks gerekli: orders koleksiyonu için toptanciId + created_at birleşik indeksini oluşturun.'
            : `Siparisler yuklenemedi${err?.code ? ` (${err.code})` : ''}.`
        );
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {davetKodu && (
        <div className="ui-card mb-6 border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-950">
          <p className="font-bold">Toptancı davet kodunuz</p>
          <p className="mt-1 font-mono text-lg font-semibold tracking-wider">{davetKodu}</p>
          <p className="mt-1 text-xs text-emerald-900/80">
            Yeni toptancı kayıtlarında bu kod veya yönetici anahtarı kullanılabilir.
          </p>
        </div>
      )}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Siparisler</h1>
        <p className="mt-1 text-sm text-slate-600">
          Gelen siparisler anlik listelenir; durumlarini buradan guncelleyebilirsiniz.
        </p>
      </div>

      {loading && <div className="ui-card h-40 animate-pulse bg-slate-100" />}

      {!loading && error && (
        <div className="ui-card border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="ui-card p-8 text-center">
          <p className="text-sm font-medium text-slate-700">Henuz gosterilecek siparis yok</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
            Musteriler katalogdan siparis olusturdugunda burada listelenecek.
          </p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-5">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
