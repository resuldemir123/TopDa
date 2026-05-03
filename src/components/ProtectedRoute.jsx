import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"
          aria-hidden
        />
        <p className="text-sm font-medium text-slate-600">Oturum kontrol ediliyor…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
