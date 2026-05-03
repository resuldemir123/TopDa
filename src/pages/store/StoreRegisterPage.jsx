import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { saveMagazaSahibiBasvuru } from '../../services/firestore';
import { useAuthStore } from '../../store/useAuthStore';

const empty = {
  magazaAdi: '',
  yetkiliAdi: '',
  telefon: '',
  adres: '',
  not: '',
  email: '',
  password: '',
};

function friendlyErr(code) {
  if (code === 'auth/email-already-in-use') return 'Bu e-posta zaten kullanılıyor (toptancı veya mağaza).';
  if (code === 'auth/weak-password') return 'Şifre en az 6 karakter olmalı.';
  if (code === 'auth/invalid-email') return 'Geçerli e-posta girin.';
  return 'Kayıt oluşturulamadı.';
}

export default function StoreRegisterPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!loading && user) {
    return <Navigate to="/magaza/panel" replace />;
  }

  function u(field, v) {
    setForm((s) => ({ ...s, [field]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const email = form.email.trim();
      const cred = await createUserWithEmailAndPassword(auth, email, form.password);
      await updateProfile(cred.user, { displayName: form.magazaAdi.trim() });
      await saveMagazaSahibiBasvuru(cred.user.uid, {
        email,
        magazaAdi: form.magazaAdi,
        yetkiliAdi: form.yetkiliAdi,
        telefon: form.telefon,
        adres: form.adres,
        not: form.not,
      });
      navigate('/magaza/onay-bekliyor', { replace: true });
    } catch (err) {
      setError(friendlyErr(err.code));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link to="/katalog" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
          ← Kataloga dön
        </Link>

        <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/30 px-4 py-4 text-sm leading-relaxed text-emerald-100 sm:px-5">
          <p className="font-bold text-emerald-200">Katalog Erişimi</p>
          <p className="mt-2 text-emerald-100/90">
            Toptancı kataloglarını görebilmek ve sipariş verebilmek için <strong>kayıt olmanız ve giriş yapmanız</strong> gerekmektedir. 
            Başvurunuz sonrası panel özellikleriniz (sipariş takibi vb.) onay sürecinin ardından açılacaktır.
          </p>
        </div>

        <h1 className="mt-8 text-3xl font-bold text-white">Mağaza sahibi kaydı</h1>
        <p className="mt-2 text-sm text-slate-400">
          Bilgileriniz yalnızca başvuru ve iletişim için kullanılır.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-slate-700 bg-slate-800/60 p-5 shadow-xl sm:p-6"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-slate-300">Mağaza / işletme adı</span>
              <input
                value={form.magazaAdi}
                onChange={(e) => u('magazaAdi', e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Yetkili adı</span>
              <input
                value={form.yetkiliAdi}
                onChange={(e) => u('yetkiliAdi', e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Telefon</span>
              <input
                value={form.telefon}
                onChange={(e) => u('telefon', e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                required
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-slate-300">Adres (il / ilçe / cadde)</span>
              <textarea
                value={form.adres}
                onChange={(e) => u('adres', e.target.value)}
                rows={2}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                placeholder="Örn. İstanbul / Kadıköy / …"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-slate-300">Not (isteğe bağlı)</span>
              <textarea
                value={form.not}
                onChange={(e) => u('not', e.target.value)}
                rows={2}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                placeholder="Vergi no, çalıştığınız markalar vb."
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-300">E-posta (giriş)</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => u('email', e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                autoComplete="username"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Şifre</span>
              <input
                type="password"
                value={form.password}
                onChange={(e) => u('password', e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                minLength={6}
                autoComplete="new-password"
                required
              />
            </label>
          </div>

          {error && (
            <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-teal-500 disabled:opacity-50"
          >
            {busy ? 'Gönderiliyor…' : 'Başvuruyu gönder'}
          </button>

          <p className="mt-5 text-center text-sm text-slate-400">
            Zaten hesabınız var mı?{' '}
            <Link to="/magaza/giris" className="font-bold text-emerald-300 hover:text-emerald-200">
              Giriş
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
