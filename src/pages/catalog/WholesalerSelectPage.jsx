import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getToptancilar } from '../../services/toptancilar';
import { useAuthStore } from '../../store/useAuthStore';

export default function WholesalerSelectPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [toptancilar, setToptancilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fixedToptanciId = String(import.meta.env.VITE_TOPTANCI_ID || '').trim();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getToptancilar();
        if (!cancelled) {
          setToptancilar(
            list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'tr'))
          );
        }
      } catch (e) {
        if (!cancelled) {
          const code = e?.code || '';
          if (import.meta.env.DEV) console.error('[getToptancilar]', e);
          if (code === 'permission-denied') {
            setError(
              'Toptancı listesine erişim reddedildi. Firebase Console → Firestore Database → Kurallar sekmesinde aşağıdaki kuralların yayınlandığından emin olun. Proje klasöründe: firebase deploy --only firestore:rules'
            );
          } else if (code === 'unavailable' || code === 'deadline-exceeded') {
            setError('Firestore şu an ulaşılamıyor veya zaman aşımı. İnternet bağlantınızı deneyin.');
          } else {
            setError(
              e?.message?.includes('Firebase')
                ? e.message
                : 'Toptancılar yüklenemedi. Bağlantınızı ve Firebase yapılandırmasını kontrol edin.'
            );
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (fixedToptanciId) {
    return <Navigate to={`/toptanci/${fixedToptanciId}`} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 bg-page-mesh">
      <header className="border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/katalog" className="inline-flex items-center rounded-xl p-1 ring-1 ring-slate-200/80 transition hover:ring-emerald-200">
            <img src="/TopDa.png" alt="TopDa" className="h-11 w-auto object-contain sm:h-14" />
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              to="/magaza/panel"
              className="rounded-xl border border-emerald-600/50 bg-emerald-950/30 px-3 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-900/40"
            >
              Mağaza paneli
            </Link>
            <button
              onClick={() => {
                import('firebase/auth').then(({ signOut }) => {
                  import('../../firebase/config').then(({ auth }) => {
                    signOut(auth).then(() => navigate('/'));
                  });
                });
              }}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="ui-card relative overflow-hidden border-emerald-100/80 p-6 sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-teal-200/20 blur-3xl" aria-hidden />
          <div className="relative">
            <p className="ui-kicker">Hoş geldiniz</p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl sm:leading-tight">
              Hangi toptancının kataloğunu açmak istiyorsunuz?
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              Aşağıdan firma seçin; yalnızca o toptancının ürünleri listelenir. Sepet ve sipariş de o toptancıya bağlı
              kalır.
            </p>
            <ol className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-slate-700">
              <li className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 ring-1 ring-slate-200/80">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs text-white">1</span>
                Toptancı seçin
              </li>
              <li className="flex items-center gap-2 rounded-xl bg-white/60 px-3 py-2 ring-1 ring-slate-200/60">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 text-xs text-slate-700">2</span>
                Ürünleri inceleyin ve sepete ekleyin
              </li>
            </ol>
          </div>
        </div>

        <div className="mt-10">
          {loading && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="ui-card h-44 animate-pulse bg-gradient-to-br from-slate-100 to-slate-50" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div
              role="alert"
              className="ui-card border-amber-200/80 bg-amber-50/90 px-5 py-4 text-sm leading-relaxed text-amber-950"
            >
              {error}
            </div>
          )}

          {!loading && !error && toptancilar.length === 0 && (
            <div className="ui-card flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-lg font-bold text-slate-800">Henüz kayıtlı toptancı yok</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Toptancılar kayıt olduğunda katalogları burada listelenecek.
              </p>
            </div>
          )}

          {!loading && !error && toptancilar.length > 0 && (
            <>
              <div className="ui-card mb-8 max-w-lg border-emerald-100/80 p-5 sm:p-6">
                <label htmlFor="toptanci-sec" className="text-sm font-bold text-slate-800">
                  Hızlı seçim
                </label>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Listeden toptancıyı seçin; katalog anında açılır.
                </p>
                <select
                  id="toptanci-sec"
                  className="ui-input mt-3 cursor-pointer bg-white font-medium"
                  defaultValue=""
                  onChange={(e) => {
                    const id = e.target.value?.trim();
                    if (id) navigate(`/toptanci/${encodeURIComponent(id)}`, { replace: false });
                  }}
                >
                  <option value="">Toptancı seçin…</option>
                  {toptancilar.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <h2 className="mb-4 text-lg font-bold text-slate-900">Tüm toptancılar</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {toptancilar.map((toptanci) => (
                  <article
                    key={toptanci.id}
                    className="ui-card ui-card-hover group flex flex-col p-5 sm:p-6"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-sm">
                      {String(toptanci.name || 'T').charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800">{toptanci.name}</h3>
                    {toptanci.yetkiliAdi && (
                      <p className="mt-2 text-sm text-slate-600">
                        <span className="font-medium text-slate-500">Yetkili:</span> {toptanci.yetkiliAdi}
                      </p>
                    )}
                    {toptanci.telefon && (
                      <p className="mt-1 text-sm text-slate-600">
                        <span className="font-medium text-slate-500">Telefon:</span>{' '}
                        <a href={`tel:${toptanci.telefon}`} className="text-emerald-700 hover:underline">
                          {toptanci.telefon}
                        </a>
                      </p>
                    )}
                    <Link
                      to={`/toptanci/${toptanci.id}`}
                      className="ui-btn-primary mt-auto pt-5 text-center"
                    >
                      Kataloğu aç
                    </Link>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
