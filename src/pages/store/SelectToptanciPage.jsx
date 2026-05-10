import { useEffect, useState } from 'react';
import { getMagazaSahibiProfile, listAllToptancilar, saveMagazaSelectedToptanci } from '../../services/firestore';
import { useAuthStore } from '../../store/useAuthStore';

export default function SelectToptanciPage() {
  const [toptancilar, setToptancilar] = useState([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const user = useAuthStore((s) => s.user);
  const uid = user?.uid;

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const list = await listAllToptancilar();
        console.debug('[SelectToptanciPage] fetched toptancilar count=', list?.length, 'sample=', list?.[0]);
        if (mounted) setToptancilar(list || []);
      } catch (e) {
        console.error('[SelectToptanciPage] failed to load toptancilar', e);
        if (mounted) setStatus({ type: 'err', text: 'Toptancılar yüklenemedi. Konsolu kontrol edin.' });
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadSelected() {
      if (!uid) return;
      try {
        const profile = await getMagazaSahibiProfile(uid);
        if (mounted && profile && profile.selectedToptanciId) {
          setStatus({ type: 'info', text: `Seçili toptancı: ${profile.selectedToptanciId}` });
        }
      } catch (e) {
        // ignore
      }
    }
    loadSelected();
    return () => (mounted = false);
  }, [uid]);

  async function handleSelect(toptanciId) {
    if (!uid) {
      setStatus({ type: 'err', text: 'Giriş yapmış bir mağaza sahibi olmalısınız.' });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      await saveMagazaSelectedToptanci(uid, toptanciId);
      setStatus({ type: 'ok', text: 'Toptancı seçimi kaydedildi.' });
    } catch (e) {
      console.error(e);
      setStatus({ type: 'err', text: 'Seçim kaydedilemedi.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-4xl px-4 py-8 mx-auto sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Toptancı Seçimi</h1>
        <p className="mt-1 text-sm text-slate-600">Mağaza panelinden sipariş yönlendirmek istediğiniz toptancıyı seçin.</p>
      </div>

      <div className="p-6 ui-card">
        {status?.type === 'ok' && <p className="mb-3 text-sm text-emerald-700">{status.text}</p>}
        {status?.type === 'err' && <p className="mb-3 text-sm text-red-700">{status.text}</p>}
        <div className="mb-4 text-xs text-slate-500">Kaynak: <strong>isletmeler</strong></div>
        {toptancilar.length === 0 ? (
          <p className="text-sm text-slate-600">Henüz toptancı bulunamadı veya yüklenemedi.</p>
        ) : (
          <ul className="space-y-3">
            {toptancilar.map((t) => (
              <li key={t.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-semibold">{t.firmaAdi || t.name || t.email || t.id}</div>
                  <div className="text-sm text-slate-500">{t.siteUrl || t.whatsapp || ''}</div>
                </div>
                <div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleSelect(t.id)}
                    className="ui-btn-primary"
                  >
                    Seç
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
