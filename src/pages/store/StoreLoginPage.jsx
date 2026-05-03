import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuthStore } from '../../store/useAuthStore';
import { resolveAuthRole } from '../../utils/authRole';

function friendlyAuthError(code) {
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'E-posta veya şifre hatalı.';
  }
  if (code === 'auth/too-many-requests') return 'Çok fazla deneme. Lütfen sonra tekrar deneyin.';
  if (code === 'auth/invalid-email') return 'Geçerli bir e-posta girin.';
  return 'Giriş yapılamadı.';
}

export default function StoreLoginPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [autoRedirectError, setAutoRedirectError] = useState('');

  useEffect(() => {
    if (loading || !user) return;
    (async () => {
      const r = await resolveAuthRole(user);
      if (r.isToptanci && !r.isMagaza) {
        setAutoRedirectError('Şu an bir toptancı hesabı ile giriş yapmışsınız. Mağaza paneline girmek için lütfen önce çıkış yapın.');
      } else {
        navigate('/magaza/panel', { replace: true });
      }
    })();
  }, [user, loading, navigate]);

  if (loading) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const r = await resolveAuthRole(cred.user);
      if (r.isToptanci && !r.isMagaza) {
        setError('Bu hesap toptancı paneline ait. Lütfen “Toptancı girişi” sayfasını kullanın.');
        await signOut(auth);
        return;
      }
      if (!r.isMagaza) {
        setError('Bu e-posta ile mağaza başvurusu bulunamadı. Önce kayıt olun.');
        await signOut(auth);
        return;
      }
      if (r.magazaStatus === 'pending') {
        navigate('/magaza/onay-bekliyor', { replace: true });
        return;
      }
      if (r.magazaStatus === 'rejected') {
        navigate('/magaza/red-edildi', { replace: true });
        return;
      }
      navigate('/magaza/panel', { replace: true });
    } catch (err) {
      setError(friendlyAuthError(err.code));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <Link to="/katalog" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
          ← Kataloga dön
        </Link>
        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-800/60 p-6 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-400">Mağaza</p>
          <h1 className="mt-2 text-2xl font-bold text-white">Mağaza sahibi girişi</h1>
          <p className="mt-2 text-sm text-slate-400">
            Onaylı mağaza hesabınızla giriş yapın. Başvurunuz inceleniyorsa ayrı bir bilgi sayfasına
            yönlendirilirsiniz.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-300">E-posta</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                autoComplete="username"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Şifre</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                autoComplete="current-password"
                required
              />
            </label>
            {(error || autoRedirectError) && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error || autoRedirectError}
              </p>
            )}
            <button
              type="submit"
              disabled={busy || loading}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-500 disabled:opacity-50"
            >
              {busy ? 'Giriş…' : 'Giriş yap'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Hesabınız yok mu?{' '}
            <Link to="/magaza/kayit" className="font-bold text-emerald-300 hover:text-emerald-200">
              Mağaza kaydı
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-slate-500">
            Toptancı mısınız?{' '}
            <Link to="/admin" className="font-semibold text-slate-300 hover:text-white">
              Toptancı girişi
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
