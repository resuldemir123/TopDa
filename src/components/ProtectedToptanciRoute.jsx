import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { resolveAuthRole } from '../utils/authRole';

function Spinner() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"
        aria-hidden
      />
      <p className="text-sm font-medium text-slate-600">Yetki kontrol ediliyor…</p>
    </div>
  );
}

/** Yalnızca toptancı (Firestore toptancilar/{uid}) erişebilir. */
export default function ProtectedToptanciRoute({ children }) {
  const { user, loading } = useAuthStore();
  const [gate, setGate] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setGate('out');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await resolveAuthRole(user);
        if (cancelled) return;
        if (r.isMagaza && !r.isToptanci) {
          if (r.magazaStatus === 'pending') setGate('magaza-onay');
          else if (r.magazaStatus === 'rejected') setGate('magaza-red');
          else setGate('magaza-panel');
          return;
        }
        if (!r.isToptanci) {
          setGate('out');
          return;
        }
        setGate('ok');
      } catch (e) {
        if (!cancelled) setGate('out');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  if (loading || gate === null) return <Spinner />;
  if (gate === 'out') return <Navigate to="/admin" replace />;
  if (gate === 'magaza-onay') return <Navigate to="/magaza/onay-bekliyor" replace />;
  if (gate === 'magaza-red') return <Navigate to="/magaza/red-edildi" replace />;
  if (gate === 'magaza-panel') return <Navigate to="/magaza/panel" replace />;
  return children;
}
