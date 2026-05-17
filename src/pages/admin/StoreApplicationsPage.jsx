import { useEffect, useState } from 'react';
import {
    listPendingMagazaBasvurulari,
    reviewMagazaBasvurusu,
} from '../../services/firestore';
import { useAuthStore } from '../../store/useAuthStore';

export default function StoreApplicationsPage() {
  const user = useAuthStore((s) => s.user);
  const [list, setList] = useState([]);
  const [orderList, setOrderList] = useState([]); // Sipariş oluşturmak isteyen mağazalar için ayrı bir liste
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [redNote, setRedNote] = useState({});

  async function load() {
    setLoading(true);
    setError('');
    try {
      const rows = await listPendingMagazaBasvurulari();
      setList(rows);
      // Sipariş oluşturmak isteyen mağazaları filtrele
      const filteredOrders = rows.filter((row) => row.wantsToOrder);
      setOrderList(filteredOrders);
    } catch (e) {
      setError(
        e?.code === 'failed-precondition'
          ? 'Firestore indeks gerekli: isletmeler koleksiyonu için tip + status + created_at birleşik indeksini oluşturun.'
          : 'Liste yüklenemedi.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(uid) {
    if (!user?.uid) return;
    setBusyId(uid);
    try {
      await reviewMagazaBasvurusu(uid, 'approved', user.uid);
      await load();
    } catch {
      setError('Onay kaydedilemedi.');
    } finally {
      setBusyId('');
    }
  }

  async function reject(uid) {
    if (!user?.uid) return;
    setBusyId(uid);
    try {
      await reviewMagazaBasvurusu(uid, 'rejected', user.uid, redNote[uid] || '');
      await load();
    } catch {
      setError('Red kaydedilemedi.');
    } finally {
      setBusyId('');
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Mağaza başvuruları</h1>
      <p className="mt-2 text-sm text-slate-600">
        Bekleyen mağaza sahipliği başvurularını inceleyin. Onaylanan kullanıcılar mağaza paneline
        erişebilir.
      </p>

      {loading && <div className="ui-card mt-6 h-32 animate-pulse bg-slate-100" />}

      {!loading && error && (
        <div className="ui-card mt-6 border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {error}
        </div>
      )}

      {!loading && !error && list.length === 0 && (
        <div className="ui-card mt-6 p-8 text-center text-sm text-slate-600">
          Bekleyen başvuru yok.
        </div>
      )}

      <h2 className="mt-6 text-lg font-semibold">Sipariş Oluşturmak İsteyen Mağazalar</h2>
      {orderList.length === 0 ? (
        <p>Hiçbir mağaza sipariş oluşturmak istemiyor.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {orderList.map((row) => (
            <li key={row.id} className="ui-card p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-900">{row.magazaAdi}</p>
                  <p className="text-sm text-slate-600">Yetkili: {row.yetkiliAdi}</p>
                  <p className="text-sm text-slate-600">{row.email}</p>
                  <p className="text-sm text-slate-600">{row.telefon}</p>
                  {row.adres && <p className="mt-2 text-sm text-slate-500">{row.adres}</p>}
                  {row.not && <p className="mt-2 text-xs text-slate-500">Not: {row.not}</p>}
                </div>
                <div className="flex min-w-[12rem] flex-col gap-2">
                  <button
                    type="button"
                    disabled={busyId === row.id}
                    onClick={() => approve(row.id)}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    Onayla
                  </button>
                  <textarea
                    placeholder="Red nedeni (isteğe bağlı)"
                    value={redNote[row.id] || ''}
                    onChange={(e) => setRedNote((s) => ({ ...s, [row.id]: e.target.value }))}
                    className="ui-input min-h-[4rem] text-xs"
                  />
                  <button
                    type="button"
                    disabled={busyId === row.id}
                    onClick={() => reject(row.id)}
                    className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-bold text-red-800 hover:bg-red-100 disabled:opacity-50"
                  >
                    Reddet
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-6 text-lg font-semibold">Tüm Başvurular</h2>
      {list.length === 0 ? (
        <p>Hiçbir başvuru bulunamadı.</p>
      ) : (
        <ul>
          {list.map((store) => (
            <li key={store.id} className="p-2 border-b">
              {store.name} - {store.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
