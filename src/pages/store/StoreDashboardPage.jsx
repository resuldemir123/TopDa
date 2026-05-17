import { onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getToptanciByCode, storeOrdersQuery } from '../../services/firestore';
import { useAuthStore } from '../../store/useAuthStore';

export default function StoreDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    const q = storeOrdersQuery(user.uid);
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setOrders(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('Siparişler yüklenemedi:', err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  async function handleJoinWithCode(e) {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setInviteBusy(true);
    setInviteError('');
    try {
      const toptanci = await getToptanciByCode(inviteCode.trim());
      if (toptanci) {
        navigate(`/toptanci/${toptanci.id}`);
      } else {
        setInviteError('Geçersiz davet kodu. Lütfen kontrol edin.');
      }
    } catch (err) {
      setInviteError(err.message?.includes('failed-precondition')
        ? 'Firestore indeks gerekli: isletmeler için status + created_at birleşik indeksini oluşturun.'
        : 'Kod kontrol edilirken hata oluştu.');
    } finally {
      setInviteBusy(false);
    }
  }

  return (
    <div className="max-w-5xl px-4 py-8 mx-auto space-y-8">
      {/* Üst Bilgi Kartı */}
      <div className="p-6 shadow-sm ui-card border-emerald-100/80 bg-gradient-to-br from-white to-emerald-50/40 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="ui-kicker">Hoş geldiniz</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Mağaza Paneli</h1>
            <p className="max-w-xl mt-3 text-sm leading-relaxed text-slate-600">
              Hesabınız <strong className="text-emerald-700">onaylı</strong>. Kataloglar üzerinden siparişlerinizi verebilir,
              aşağıdaki listeden geçmiş siparişlerinizin durumunu anlık olarak takip edebilirsiniz.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <Link to="/katalog" className="px-8 text-center shadow-md ui-btn-primary h-fit shadow-emerald-600/20">
              Tüm Kataloglar
            </Link>

            {/* Kodla Katıl Formu */}
            <form onSubmit={handleJoinWithCode} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Davet Kodu Gir"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-32 px-3 py-2 text-sm bg-white border outline-none rounded-xl border-slate-200 focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={inviteBusy}
                  className="px-4 py-2 text-sm font-bold text-white rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50"
                >
                  Git
                </button>
              </div>
              {inviteError && <p className="text-[10px] text-red-600 font-bold">{inviteError}</p>}
            </form>
          </div>
        </div>
      </div>

      {/* Sipariş Geçmişi */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Sipariş Geçmişim</h2>
          <span className="text-xs text-slate-500">{orders.length} toplam kayıt</span>
        </div>

        {loading ? (
          <div className="h-48 ui-card animate-pulse bg-slate-50" />
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center ui-card text-slate-500">
            <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-slate-100">🛒</div>
            <p className="text-sm">Henüz bir siparişiniz bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1">
            {orders.map((order) => (
              <div key={order.id} className="overflow-hidden transition-all ui-card border-slate-200 hover:shadow-md">
                <div className="flex flex-wrap items-start justify-between p-4 border-b border-slate-50 bg-slate-50/50">
                  <div>
                    <p className="text-xs font-bold tracking-tight uppercase text-slate-500">Sipariş No: #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {order.created_at?.toDate
                        ? order.created_at.toDate().toLocaleString('tr-TR')
                        : 'Tarih belirsiz'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-slate-100 text-slate-600'
                      }`}>
                      {order.status === 'pending' ? 'Beklemede' :
                        order.status === 'approved' ? 'Onaylandi' :
                          order.status === 'shipped' ? 'Kargoda' :
                            order.status === 'delivered' ? 'Teslim Edildi' :
                              order.status === 'cancelled' ? 'İptal Edildi' :
                                order.status}
                    </span>
                    <span className="text-sm font-bold text-emerald-700">
                      {order.total_amount?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded bg-slate-200 flex items-center justify-center text-[10px]">🏢</div>
                    <p className="text-sm font-semibold text-slate-700">
                      {order.toptanci_info?.firmaAdi || 'Bilinmeyen Toptancı'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-slate-600">
                        <span className="flex-1 pr-4 truncate">• {item.name} ({item.variantName || 'Standart'})</span>
                        <span className="font-medium text-slate-900">{item.quantity} Çift</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 text-sm border-dashed ui-card text-slate-500 bg-slate-50/30">
        <p className="flex items-center gap-2 font-semibold text-slate-700">
          <span>💡</span> İpucu
        </p>
        <p className="mt-2 text-xs leading-relaxed">
          Siparişleriniz doğrudan toptancının paneline düşer. Durum güncellemelerini buradan takip edebilirsiniz.
          Herhangi bir sorunuz olduğunda ilgili toptancı ile WhatsApp üzerinden iletişime geçebilirsiniz.
        </p>
      </div>
    </div>
  );
}
