import { Link, useParams } from 'react-router-dom';
import ProductGrid from './ProductGrid';
import { useCartStore } from '../../store/useCartStore';

export default function CatalogHomePage() {
  const { toptanciId } = useParams();
  const basePath = toptanciId ? `/toptanci/${toptanciId}` : '/katalog';
  const totalPairs = useCartStore((s) =>
    toptanciId ? s.getTotalPairsForToptanci(toptanciId) : s.getTotalPairs()
  );
  const lineCount = useCartStore((s) =>
    toptanciId ? s.getItemsForToptanci(toptanciId).length : s.items.length
  );

  return (
    <>
      <div className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="ui-card border-emerald-100/60 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20 p-6 sm:p-8">
            <p className="ui-kicker">Toptan sipariş</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Ürün kataloğu</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Modelleri inceleyin; beden ve adet seçimini ürün sayfasında yapın. Sipariş özetinizi{' '}
              <strong className="font-semibold text-slate-800">Sepet</strong> üzerinden tamamlayın.
            </p>
            {lineCount > 0 ? (
              <div className="mt-5 inline-flex flex-wrap items-center gap-3 rounded-xl bg-emerald-600/10 px-4 py-3 text-sm ring-1 ring-emerald-200/60">
                <span className="font-semibold text-emerald-900">
                  Sepette {lineCount} kalem · {totalPairs} çift
                </span>
                <Link
                  to={`${basePath}/sepet`}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500"
                >
                  Sepete git
                </Link>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Üst menüden{' '}
                <Link to={`${basePath}/sepet`} className="font-semibold text-emerald-700 hover:underline">
                  Sepet
                </Link>
                ’e istediğiniz zaman ulaşabilirsiniz.
              </p>
            )}
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <ProductGrid />
      </main>
    </>
  );
}
