import { signOut } from 'firebase/auth';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { useAuthStore } from '../store/useAuthStore';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const catalogPath = user?.uid ? `/toptanci/${user.uid}` : '/katalog';

  async function handleLogout() {
    await signOut(auth);
    navigate('/admin');
  }

  const navCls = ({ isActive }) =>
    `rounded-xl px-3.5 py-2 text-sm font-semibold transition ${isActive ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6">
          <Link
            to="/admin/siparisler"
            className="text-base font-bold tracking-tight text-white"
          >
            TopDa <span className="font-normal text-emerald-400">Panel</span>
          </Link>
          <nav className="flex flex-1 flex-wrap items-center gap-1 sm:gap-2">
            <NavLink to="/admin/siparisler" className={navCls} end={false}>
              Siparişler
            </NavLink>
            <NavLink to="/admin/urunler" className={navCls}>
              Ürünler
            </NavLink>
            <NavLink to="/admin/magaza-basvurulari" className={navCls}>
              Mağaza başvuruları
            </NavLink>
            {import.meta.env.VITE_TOPTANCI_SITE_URL && (
              <a
                href={import.meta.env.VITE_TOPTANCI_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                Site
              </a>
            )}
          </nav>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:ml-auto sm:w-auto">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>
      <div className="min-h-[calc(100vh-4.5rem)]">{children}</div>
    </div>
  );
}
