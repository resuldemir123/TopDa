import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import ProtectedToptanciRoute from './components/ProtectedToptanciRoute';
import ProtectedMagazaPanel from './components/ProtectedMagazaPanel';
import AdminLayout from './components/AdminLayout';
import StoreLayout from './components/StoreLayout';
import CatalogLayout from './components/CatalogLayout';
import ProtectedCatalog from './components/ProtectedCatalog';
import CatalogHomePage from './pages/catalog/CatalogHomePage';
import WholesalerSelectPage from './pages/catalog/WholesalerSelectPage';
import ProductDetailPage from './pages/catalog/ProductDetailPage';
import WishlistPage from './pages/catalog/WishlistPage';
import CartPage from './pages/catalog/CartPage';
import OrderSummaryPage from './pages/shared/OrderSummaryPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';
import OrdersPage from './pages/admin/OrdersPage';
import ProductsPage from './pages/admin/ProductsPage';
import StoreApplicationsPage from './pages/admin/StoreApplicationsPage';
import StoreLoginPage from './pages/store/StoreLoginPage';
import StoreRegisterPage from './pages/store/StoreRegisterPage';
import StoreOnayBekliyorPage from './pages/store/StoreOnayBekliyorPage';
import StoreRedEdildiPage from './pages/store/StoreRedEdildiPage';
import StoreDashboardPage from './pages/store/StoreDashboardPage';
import LandingPage from './pages/LandingPage';

export default function App() {
  useEffect(() => {
    const unsub = useAuthStore.getState().init();
    return () => unsub?.();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/katalog"
        element={
          <ProtectedCatalog>
            <WholesalerSelectPage />
          </ProtectedCatalog>
        }
      />
      <Route
        path="/toptanci/:toptanciId"
        element={
          <ProtectedCatalog>
            <CatalogLayout />
          </ProtectedCatalog>
        }
      >
        <Route index element={<CatalogHomePage />} />
        <Route path="listem" element={<WishlistPage />} />
        <Route path="sepet" element={<CartPage />} />
        <Route path="ozet" element={<OrderSummaryPage />} />
        <Route path="urun/:productId" element={<ProductDetailPage />} />
      </Route>

      <Route path="/admin" element={<AdminLoginPage />} />
      <Route path="/admin/kayit" element={<AdminRegisterPage />} />
      <Route
        path="/admin/siparisler"
        element={
          <ProtectedToptanciRoute>
            <AdminLayout>
              <OrdersPage />
            </AdminLayout>
          </ProtectedToptanciRoute>
        }
      />
      <Route
        path="/admin/urunler"
        element={
          <ProtectedToptanciRoute>
            <AdminLayout>
              <ProductsPage />
            </AdminLayout>
          </ProtectedToptanciRoute>
        }
      />
      <Route
        path="/admin/magaza-basvurulari"
        element={
          <ProtectedToptanciRoute>
            <AdminLayout>
              <StoreApplicationsPage />
            </AdminLayout>
          </ProtectedToptanciRoute>
        }
      />

      <Route path="/magaza/giris" element={<StoreLoginPage />} />
      <Route path="/magaza/kayit" element={<StoreRegisterPage />} />
      <Route path="/magaza/onay-bekliyor" element={<StoreOnayBekliyorPage />} />
      <Route path="/magaza/red-edildi" element={<StoreRedEdildiPage />} />
      <Route
        path="/magaza/panel"
        element={
          <ProtectedMagazaPanel>
            <StoreLayout>
              <StoreDashboardPage />
            </StoreLayout>
          </ProtectedMagazaPanel>
        }
      />

      <Route path="*" element={<Navigate to="/katalog" replace />} />
    </Routes>
  );
}
