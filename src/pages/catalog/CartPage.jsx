import { Link, useParams } from 'react-router-dom';
import CartDetails from './CartDetails';
import OrderForm from './OrderForm';

export default function CartPage() {
  const { toptanciId } = useParams();
  const basePath = toptanciId ? `/toptanci/${toptanciId}` : '/katalog';
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="ui-breadcrumb mb-8" aria-label="Sayfa konumu">
        <Link to={basePath}>Katalog</Link>
        <span className="text-slate-300" aria-hidden>
          /
        </span>
        <span className="font-semibold text-slate-800">Sepet</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Sepetim</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          Her ürün ayrı kartta listelenir. Beden ve adetleri kontrol edin; aşağıdaki form ile siparişi
          tamamlayın.
        </p>
      </header>

      <CartDetails />

      <div className="mt-12">
        <OrderForm />
      </div>
    </div>
  );
}
