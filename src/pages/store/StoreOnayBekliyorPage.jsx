import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuthStore } from '../../store/useAuthStore';
import { resolveAuthRole } from '../../utils/authRole';

export default function StoreOnayBekliyorPage() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();
  const [ok, setOk] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setOk(false);
      return;
    }
    let c = false;
    (async () => {
      const r = await resolveAuthRole(user);
      if (c) return;
      if (!r.isMagaza) {
        setOk(false);
        return;
      }
      if (r.magazaStatus === 'approved') {
        navigate('/magaza/panel', { replace: true });
        return;
      }
      if (r.magazaStatus === 'rejected') {
        navigate('/magaza/red-edildi', { replace: true });
        return;
      }
      setOk(true);
    })();
    return () => {
      c = true;
    };
  }, [user, loading, navigate]);

  async function handleLogout() {
    await signOut(auth);
    navigate('/magaza/giris');
  }

  if (loading || ok === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
      </div>
    );
  }

  if (!user || ok === false) {
    return <Navigate to="/magaza/giris" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-16 text-center sm:px-6">
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-500/30 bg-slate-800/80 p-8 shadow-xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-3xl">
          ⏳
        </div>
        <h1 className="text-2xl font-bold text-white">Başvurunuz alındı</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          Mağaza bilgileriniz <strong className="text-amber-200">doğrulama</strong> için sırada. Gerçek
          mağaza olup olmadığınızı teyit etmek amacıyla inceleme yapılır; bu süre genelde birkaç iş günü
          sürer.
        </p>
        <p className="mt-4 text-sm text-slate-400">
          Onaylandığında aynı e-posta ile giriş yaparak panele erişebilirsiniz. Şimdilik katalogdan
          toptancı seçerek (giriş yapmadan) alışverişe devam edebilirsiniz.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/katalog"
            className="inline-flex justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-center text-sm font-bold text-white hover:bg-emerald-500"
          >
            Kataloga git
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            Çıkış yap
          </button>
        </div>
      </div>
    </div>
  );
}
