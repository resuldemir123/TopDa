import { Link, NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuthStore } from '../store/useAuthStore';

const navCls = ({ isActive }) =>
  `rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function StoreLayout({ children }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  async function handleLogout() {
    await signOut(auth);
    navigate('/magaza/giris');
  }

  return (
    <div className="min-h-screen bg-slate-50 bg-page-mesh">
      <header className="border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/magaza/panel" className="text-base font-bold text-slate-900">
            Mağaza <span className="font-semibold text-emerald-600">paneli</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/magaza/panel" end className={navCls}>
              Ana sayfa
            </NavLink>
            <NavLink to="/katalog" className={navCls}>
              Toptancı seç
            </NavLink>
          </nav>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="hidden max-w-[10rem] truncate sm:inline">{user?.email}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
