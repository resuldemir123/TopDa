import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase/config';
import {
  ensureToptanciDavetKodu,
  saveToptanciProfile,
} from '../../services/firestore';
import { getToptancilar } from '../../services/toptancilar';
import { useAuthStore } from '../../store/useAuthStore';
import { randomDavetKodu } from '../../utils/davetKodu';

const emptyForm = {
  davetAnahtari: '',
  firmaAdi: '',
  yetkiliAdi: '',
  telefon: '',
  whatsapp: '',
  siteUrl: '',
  email: '',
  password: '',
};

function friendlyRegisterError(code) {
  if (code === 'auth/email-already-in-use') return 'Bu e-posta ile kayıtlı bir hesap var.';
  if (code === 'auth/invalid-email') return 'Geçerli bir e-posta adresi girin.';
  if (code === 'auth/weak-password') return 'Şifre en az 6 karakter olmalı.';
  return 'Kayıt oluşturulamadı. Bilgileri kontrol edin.';
}

export default function AdminRegisterPage() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [doneInfo, setDoneInfo] = useState(null);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const list = await getToptancilar();
      const master = String(import.meta.env.VITE_TOPTANCI_MASTER_KAYIT_ANAHTARI || '').trim();
      const girilen = String(form.davetAnahtari || '').trim();

      if (list.length === 0) {
        if (!master) {
          setError(
            'İlk toptancı kaydı için proje kökünde .env dosyasına VITE_TOPTANCI_MASTER_KAYIT_ANAHTARI ekleyin.'
          );
          return;
        }
        if (girilen !== master) {
          setError('İlk kayıt için yönetici kayıt anahtarını doğru girin.');
          return;
        }
      } else {
        const eslesen =
          (master && girilen === master) ||
          list.some((t) => t.davetKodu && String(t.davetKodu) === girilen);
        if (!eslesen) {
          setError(
            'Kayıt anahtarı geçersiz. Size iletilen toptancı davet kodunu veya yönetici anahtarını girin.'
          );
          return;
        }
      }

      const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
      await updateProfile(cred.user, { displayName: form.firmaAdi.trim() });
      await saveToptanciProfile(cred.user.uid, {
        firmaAdi: form.firmaAdi,
        yetkiliAdi: form.yetkiliAdi,
        telefon: form.telefon,
        whatsapp: form.whatsapp,
        siteUrl: form.siteUrl,
        email: form.email,
      });
      const paylasimKodu = await ensureToptanciDavetKodu(cred.user.uid, randomDavetKodu);
      setDoneInfo({ kod: paylasimKodu, firma: form.firmaAdi.trim() });
    } catch (err) {
      setError(friendlyRegisterError(err.code) || err.message || 'Kayıt başarısız');
    } finally {
      setBusy(false);
    }
  }

  if (!loading && user && !doneInfo) {
    return <Navigate to="/admin/siparisler" replace />;
  }

  if (doneInfo) {
    return (
      <div className="min-h-screen bg-slate-900 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-lg rounded-2xl border border-emerald-500/30 bg-slate-800/80 p-8 text-center shadow-xl">
          <h1 className="text-2xl font-bold text-white">Kayıt tamamlandı</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Yeni toptancıların sizin adınıza kayıt olabilmesi için aşağıdaki{' '}
            <strong className="text-emerald-300">paylaşım kodunu</strong> güvenle iletin. Yönetici
            anahtarınız (.env) ile de yeni kayıt açılabilir.
          </p>
          <div className="mt-6 rounded-xl bg-slate-900/80 px-4 py-4 font-mono text-xl font-bold tracking-widest text-emerald-400">
            {doneInfo.kod}
          </div>
          <p className="mt-4 text-xs text-slate-500">Firma: {doneInfo.firma}</p>
          <Link
            to="/admin/siparisler"
            className="mt-8 inline-flex w-full justify-center rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-500"
          >
            Panele git
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link to="/katalog" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
            Kataloga dön
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Toptancı kaydı</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Kayıt için geçerli bir <strong className="text-slate-200">davet / yönetici anahtarı</strong>{' '}
            gerekir. Kayıt sonrası size özel bir paylaşım kodu üretilir.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 shadow-xl sm:p-6">
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-300">Kayıt anahtarı (davet veya yönetici)</span>
            <input
              value={form.davetAnahtari}
              onChange={(e) => updateField('davetAnahtari', e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              placeholder="Size iletilen kod"
              autoComplete="off"
              required
            />
          </label>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-slate-300">Firma adı</span>
              <input
                value={form.firmaAdi}
                onChange={(e) => updateField('firmaAdi', e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                placeholder="MST Terlik"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Yetkili adı</span>
              <input
                value={form.yetkiliAdi}
                onChange={(e) => updateField('yetkiliAdi', e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Telefon</span>
              <input
                value={form.telefon}
                onChange={(e) => updateField('telefon', e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">WhatsApp numarası</span>
              <input
                value={form.whatsapp}
                onChange={(e) => updateField('whatsapp', e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                placeholder="905510000000"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Site adresi</span>
              <input
                value={form.siteUrl}
                onChange={(e) => updateField('siteUrl', e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                placeholder="https://firma.com"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">E-posta</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                autoComplete="username"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Şifre</span>
              <input
                type="password"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                autoComplete="new-password"
                minLength={6}
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
            className="mt-6 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {busy ? 'Kayıt oluşturuluyor…' : 'Toptancı hesabı oluştur'}
          </button>

          <p className="mt-5 text-center text-sm text-slate-400">
            Zaten hesabınız var mı?{' '}
            <Link to="/admin" className="font-semibold text-emerald-300 hover:text-emerald-200">
              Giriş yapın
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-slate-500">
            Mağaza sahibi misiniz?{' '}
            <Link to="/magaza/kayit" className="font-semibold text-teal-300 hover:text-teal-200">
              Mağaza kaydı
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
