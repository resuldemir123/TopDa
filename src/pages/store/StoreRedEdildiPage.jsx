import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuthStore } from '../../store/useAuthStore';
import { resolveAuthRole } from '../../utils/authRole';

export default function StoreRedEdildiPage() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setInfo({ redirect: true });
      return;
    }
    let c = false;
    (async () => {
      const r = await resolveAuthRole(user);
      if (c) return;
      if (!r.isMagaza) {
        setInfo({ redirect: true });
        return;
      }
      if (r.magazaStatus === 'pending') {
        navigate('/magaza/onay-bekliyor', { replace: true });
        return;
      }
      if (r.magazaStatus === 'approved') {
        navigate('/magaza/panel', { replace: true });
        return;
      }
      setInfo({ red: r.magazaProfile?.red_nedeni || '' });
    })();
    return () => {
      c = true;
    };
  }, [user, loading, navigate]);

  async function handleLogout() {
    await signOut(auth);
    navigate('/magaza/giris');
  }

  if (loading || info === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
      </div>
    );
  }

  if (info.redirect || !user) {
    return <Navigate to="/magaza/giris" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-16 text-center sm:px-6">
      <div className="mx-auto max-w-lg rounded-2xl border border-red-500/30 bg-slate-800/80 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white">Başvuru onaylanmadı</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          Mağaza başvurunuz bu aşamada uygun bulunmadı. İsterseniz bilgilerinizi gözden geçirip destek ile
          iletişime geçebilirsiniz.
        </p>
        {info.red && (
          <p className="mt-4 rounded-xl bg-red-950/40 px-4 py-3 text-sm text-red-200">{info.red}</p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-600"
          >
            Çıkış yap
          </button>
          <Link to="/katalog" className="ui-btn-secondary justify-center bg-white text-center">
            Kataloga dön
          </Link>
        </div>
      </div>
    </div>
  );
}
