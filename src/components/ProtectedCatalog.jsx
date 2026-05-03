import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuthStore } from '../store/useAuthStore';
import { resolveAuthRole } from '../utils/authRole';

function Spinner() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"
        aria-hidden
      />
      <p className="text-sm font-medium text-slate-600">Erişim kontrol ediliyor…</p>
    </div>
  );
}

/** Katalog erişim koruması: Sadece mağaza girişi yapmış olanlar. */
export default function ProtectedCatalog({ children }) {
  const { user, loading } = useAuthStore();
  const [gate, setGate] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setGate('login');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await resolveAuthRole(user);
        if (cancelled) return;
        
        if (r.isToptanci) {
          setGate('admin');
          return;
        }
        
        if (!r.isMagaza) {
          setGate('unauthorized');
          return;
        }

        setGate('ok');
      } catch (e) {
        if (!cancelled) setGate('unauthorized');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  if (loading || gate === null) return <Spinner />;
  
  if (gate === 'login') return <Navigate to="/magaza/giris" replace />;
  if (gate === 'admin') return <Navigate to="/admin/siparisler" replace />;
  if (gate === 'unauthorized') return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-xl font-bold text-slate-900">Erişim Yetkiniz Yok</h1>
      <p className="mt-2 text-slate-600">Bu sayfayı görmek için mağaza hesabı gereklidir.</p>
      <button 
        onClick={() => signOut(auth)}
        className="mt-4 ui-btn-primary"
      >
        Farklı Hesapla Giriş Yap
      </button>
    </div>
  );
  
  return children;
}
