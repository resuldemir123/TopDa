import { Link, NavLink, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { getToptanciById } from '../services/toptancilar';

function navLinkClass({ isActive }) {
  return `rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
    isActive
      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;
}

export default function CatalogLayout() {
  const { toptanciId } = useParams();
  const basePath = toptanciId ? `/toptanci/${toptanciId}` : '/katalog';
  const totalPairs = useCartStore((s) =>
    toptanciId ? s.getTotalPairsForToptanci(toptanciId) : s.getTotalPairs()
  );
  const lineCount = useCartStore((s) =>
    toptanciId ? s.getItemsForToptanci(toptanciId).length : s.items.length
  );
  const wishCount = useWishlistStore((s) => s.items.length);
  const { user } = useAuthStore();
  const [toptanci, setToptanci] = useState(null);

  useEffect(() => {
    if (!toptanciId) return;
    let cancelled = false;
    getToptanciById(toptanciId)
      .then((profile) => {
        if (!cancelled) setToptanci(profile);
      })
      .catch(() => {
        if (!cancelled) setToptanci(null);
      });
    return () => {
      cancelled = true;
    };
  }, [toptanciId]);

  return (
    <div className="min-h-screen bg-slate-50 bg-page-mesh">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 shadow-nav backdrop-blur-lg">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6">
          <Link
            to={basePath}
            className="mr-1 flex shrink-0 items-center rounded-xl bg-white p-1.5 ring-1 ring-slate-200/80 transition hover:ring-emerald-200"
          >
            <img src="/TopDa.png" alt="TopDa" className="h-10 w-auto object-contain sm:h-12" />
          </Link>

          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
            <NavLink to={basePath} end className={navLinkClass}>
              Katalog
            </NavLink>
            <NavLink to={`${basePath}/listem`} className={navLinkClass}>
              <span className="inline-flex items-center gap-1.5">
                Listem
                {wishCount > 0 && (
                  <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-900 tabular-nums">
                    {wishCount}
                  </span>
                )}
              </span>
            </NavLink>
            {user && (toptanci?.siteUrl || import.meta.env.VITE_TOPTANCI_SITE_URL) && (
              <a
                href={toptanci?.siteUrl || import.meta.env.VITE_TOPTANCI_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Toptancı sitesi
              </a>
            )}
          </div>

          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <NavLink
              to="/magaza/panel"
              className={({ isActive }) =>
                `inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`
              }
            >
              Mağaza Paneli
            </NavLink>
            <NavLink
              to={`${basePath}/sepet`}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-xl border-2 px-3.5 py-2 text-sm font-bold transition ${
                  isActive
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/70'
                }`
              }
            >
              <svg className="h-4 w-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Sepet
              {lineCount > 0 && (
                <span className="rounded-lg bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white tabular-nums">
                  {totalPairs} çift
                </span>
              )}
            </NavLink>
          </div>
        </nav>
      </header>

      {toptanci && (
        <div className="border-b border-emerald-100/80 bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/50">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 text-sm sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                B2B
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold text-slate-900">{toptanci.name}</p>
                <p className="text-xs text-slate-500">Bu katalogdaki fiyat ve stoklar bu toptancıya aittir.</p>
              </div>
            </div>
            <Link
              to="/katalog"
              className="ui-btn-secondary shrink-0 py-2 text-xs sm:text-sm"
            >
              Toptancı değiştir
            </Link>
          </div>
        </div>
      )}

      <Outlet />

      <footer className="mt-auto border-t border-slate-200/80 bg-white/70 py-8 text-center text-xs text-slate-500 backdrop-blur-sm">
        <p className="font-medium text-slate-600">TopDa — Bayi sipariş ekranı</p>
        <p className="mt-1">© {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
