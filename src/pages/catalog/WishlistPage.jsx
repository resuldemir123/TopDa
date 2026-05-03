import { Link, useParams } from 'react-router-dom';
import { useWishlistStore } from '../../store/useWishlistStore';

const showPrice = import.meta.env.VITE_SHOW_PRICE !== 'false';

function categoryLabel(c) {
  if (c === 'male') return 'Erkek';
  if (c === 'female') return 'Kadın';
  return 'Unisex';
}

export default function WishlistPage() {
  const { toptanciId } = useParams();
  const basePath = toptanciId ? `/toptanci/${toptanciId}` : '/katalog';
  const allItems = useWishlistStore((s) => s.items);
  const items = toptanciId
    ? allItems.filter((item) => !item.toptanciId || item.toptanciId === toptanciId)
    : allItems;
  const remove = useWishlistStore((s) => s.remove);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="ui-card mb-8 border-amber-100/80 bg-gradient-to-br from-amber-50/40 via-white to-white p-6 sm:p-8">
        <p className="ui-kicker text-amber-800">Favoriler</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Listem</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Beğendiğiniz modelleri burada tutun. Ürüne girip beden seçerek sepete ekleyebilirsiniz. WhatsApp
          bildirimi siparişi sepetten tamamladıktan sonra kullanılır.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="ui-card flex flex-col items-center p-12 text-center sm:p-16">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-lg font-bold text-slate-800">Listeniz boş</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Katalog veya ürün sayfasındaki &quot;Listeye ekle&quot; ile modelleri buraya ekleyin.
          </p>
          <Link to={basePath} className="ui-btn-primary mt-8 inline-flex">
            Kataloga git
          </Link>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.productId} className="ui-card ui-card-hover flex flex-col overflow-hidden transition hover:-translate-y-0.5">
              <Link to={`${basePath}/urun/${item.productId}`} className="aspect-square bg-slate-100">
                {item.image ? (
                  <img src={item.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    Görsel yok
                  </div>
                )}
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                  {categoryLabel(item.category)}
                </p>
                <Link
                  to={`${basePath}/urun/${item.productId}`}
                  className="mt-1 font-semibold text-slate-900 hover:text-emerald-700"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-slate-500">{item.code}</p>
                {showPrice && typeof item.price === 'number' && (
                  <p className="mt-2 text-sm font-semibold tabular-nums text-slate-800">
                    {item.price.toLocaleString('tr-TR')} ₺ / çift
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to={`${basePath}/urun/${item.productId}`} className="ui-btn-primary flex-1 text-center sm:flex-none">
                    Ürüne git · sepete ekle
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(item.productId)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700"
                  >
                    Kaldır
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
