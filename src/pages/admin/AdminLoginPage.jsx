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
  if (code === 'auth/too-many-requests') {
    return 'Çok fazla deneme. Lütfen bir süre sonra tekrar deneyin.';
  }
  if (code === 'auth/invalid-email') {
    return 'Geçerli bir e-posta adresi girin.';
  }
  return 'Giriş yapılamadı. Bilgilerinizi kontrol edin.';
}

export default function AdminLoginPage() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [roleDest, setRoleDest] = useState(null);

  useEffect(() => {
    if (loading || !user) {
      setRoleDest(null);
      return;
    }
    let c = false;
    (async () => {
      try {
        const r = await resolveAuthRole(user);
        if (c) return;
        if (r.isToptanci) {
          setRoleDest('/admin/siparisler');
        } else if (r.isMagaza) {
          // Mağazacı toptancı girişine geldiyse otomatik yönlendirme YAPMA.
          // Sadece hata mesajı göster veya çıkış yapmasını bekle.
          setRoleDest(null);
          setError('Şu an bir mağaza hesabı ile giriş yapmışsınız. Toptancı paneline girmek için lütfen önce çıkış yapın.');
        } else {
          setRoleDest(null);
        }
      } catch (e) {
        if (!c) setRoleDest(null);
      }
    })();
    return () => {
      c = true;
    };
  }, [user, loading]);

  if (!loading && user && roleDest) {
    return <Navigate to={roleDest} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const r = await resolveAuthRole(cred.user);
      if (r.isMagaza && !r.isToptanci) {
        await signOut(auth);
        setError('Bu hesap mağaza paneline aittir. “Mağaza girişi” sayfasını kullanın.');
        return;
      }
      if (!r.isToptanci) {
        await signOut(auth);
        setError('Toptancı kaydı bulunamadı. Önce toptancı kaydı oluşturun veya mağaza girişini deneyin.');
        return;
      }
      navigate('/admin/siparisler', { replace: true });
    } catch (err) {
      setError(friendlyAuthError(err.code) || 'Giriş başarısız');
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-900 lg:flex-row">
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Toptancı</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Toptancı paneli girişi</h1>
          <p className="mt-2 text-sm text-slate-400">
            Sipariş ve ürün yönetimi için toptancı hesabınızla giriş yapın.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-slate-300">
                E-posta
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                placeholder="ornek@sirket.com"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-slate-300">
                Şifre
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                autoComplete="current-password"
                required
              />
            </div>
            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500 disabled:opacity-50"
            >
              {loading ? 'Kontrol ediliyor…' : 'Giriş yap'}
            </button>
            <p className="text-center text-sm text-slate-400">
              Toptancı hesabı yok mu?{' '}
              <Link to="/admin/kayit" className="font-semibold text-emerald-300 hover:text-emerald-200">
                Kayıt olun
              </Link>
            </p>
            <p className="text-center text-sm text-slate-500">
              Mağaza sahibi misiniz?{' '}
              <Link to="/magaza/giris" className="font-semibold text-teal-300 hover:text-teal-200">
                Mağaza girişi
              </Link>
            </p>
          </form>
        </div>
      </div>
      <div
        className="relative hidden flex-1 overflow-hidden bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 lg:block"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent" />
        <div className="relative flex h-full min-h-[320px] items-center justify-center p-12">
          <div className="max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
            <p className="text-sm font-medium leading-relaxed text-slate-300">
              Siparişler, stok ve iletişim tek panelden yönetilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
