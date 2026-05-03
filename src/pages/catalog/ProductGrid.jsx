import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProducts } from '../../services/firestore';
import { useWishlistStore } from '../../store/useWishlistStore';

const showPrice = import.meta.env.VITE_SHOW_PRICE !== 'false';

function categoryLabel(c) {
  if (c === 'male') return 'Erkek';
  if (c === 'female') return 'Kadın';
  return 'Unisex';
}

function ProductCardActions({ product }) {
  const { toptanciId } = useParams();
  const basePath = toptanciId ? `/toptanci/${toptanciId}` : '/katalog';
  const inList = useWishlistStore((s) => s.items.some((i) => i.productId === product.id));
  const toggle = useWishlistStore((s) => s.toggle);
  const v0 = product.variants?.[0];

  function handleListToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!v0) return;
    toggle({
      productId: product.id,
      toptanciId: product.toptanciId || '',
      name: product.name,
      code: product.code,
      image: v0.image,
      price: product.price,
      category: product.category,
    });
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Link
        to={`${basePath}/urun/${product.id}`}
        className="ui-btn-primary flex-1 text-center text-sm sm:flex-none"
      >
        İncele ve sepete ekle
      </Link>
      <button
        type="button"
        onClick={handleListToggle}
        className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition sm:flex-none ${
          inList
            ? 'border-amber-300 bg-amber-50 text-amber-900'
            : 'border-slate-200 bg-white text-slate-700 hover:border-amber-200 hover:bg-amber-50/50'
        }`}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill={inList ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        {inList ? 'Listede' : 'Listeye ekle'}
      </button>
    </div>
  );
}

export default function ProductGrid() {
  const { toptanciId } = useParams();
  const basePath = toptanciId ? `/toptanci/${toptanciId}` : '/katalog';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!toptanciId || !String(toptanciId).trim()) {
        if (!cancelled) {
          setProducts([]);
          setLoading(false);
        }
        return;
      }
      try {
        const list = await getProducts(toptanciId);
        if (!cancelled) setProducts(list);
      } catch (e) {
        if (!cancelled) setError('Ürünler yüklenemedi. Bağlantınızı kontrol edin.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toptanciId]);

  return (
    <section>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Ürünler</h2>
          <p className="mt-1 text-sm text-slate-600">
            Karttan detaya gidin; beden ve adet seçerek sepete ekleyin.
          </p>
        </div>
        {!loading && !error && products.length > 0 && (
          <p className="text-sm font-semibold tabular-nums text-slate-500">{products.length} ürün</p>
        )}
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="ui-card h-96 animate-pulse bg-gradient-to-b from-slate-100 to-slate-50" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="ui-card border-amber-200/80 bg-amber-50 px-5 py-4 text-sm text-amber-950">{error}</div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="ui-card col-span-full flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <p className="text-lg font-bold text-slate-800">Henüz ürün yok</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            Bu katalogda henüz sergilenen bir ürün bulunmuyor.
          </p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const v0 = p.variants?.[0];
            const img = v0?.image || '';
            return (
              <article
                key={p.id}
                className="ui-card ui-card-hover group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-0.5"
              >
                <Link
                  to={`${basePath}/urun/${p.id}`}
                  className="relative aspect-square overflow-hidden bg-slate-100"
                >
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">
                      Görsel yok
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-800 shadow-sm backdrop-blur-sm">
                    {categoryLabel(p.category)}
                  </span>
                </Link>
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <Link
                    to={`${basePath}/urun/${p.id}`}
                    className="text-base font-bold text-slate-900 transition group-hover:text-emerald-700"
                  >
                    {p.name}
                  </Link>
                  <p className="mt-0.5 text-sm text-slate-500">Kod: {p.code}</p>
                  {showPrice && typeof p.price === 'number' && (
                    <p className="mt-3 text-xl font-bold tabular-nums text-slate-900">
                      {p.price.toLocaleString('tr-TR')} <span className="text-base font-semibold text-slate-500">₺</span>
                      <span className="ml-1 text-xs font-medium text-slate-400">/ çift</span>
                    </p>
                  )}
                  {p.variants?.length > 1 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-medium text-slate-400">Renkler:</span>
                      {p.variants.map((v, i) => (
                        <span
                          key={i}
                          title={v.color}
                          className="h-5 w-5 rounded-full border-2 border-white shadow-md ring-1 ring-slate-200"
                          style={{ backgroundColor: v.color_hex || '#ccc' }}
                        />
                      ))}
                    </div>
                  )}
                  <ProductCardActions product={p} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
