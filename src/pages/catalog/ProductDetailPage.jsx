import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProductById } from '../../services/firestore';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { sumSizeQty } from '../../utils/cartMath';

const showPrice = import.meta.env.VITE_SHOW_PRICE !== 'false';

function categoryLabel(c) {
  if (c === 'male') return 'Erkek';
  if (c === 'female') return 'Kadın';
  return 'Unisex';
}

function sizeKeysFromStock(stock) {
  if (!stock || typeof stock !== 'object') return [];
  return Object.keys(stock).sort((a, b) => Number(a) - Number(b));
}

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { toptanciId } = useParams();
  const navigate = useNavigate();
  const basePath = toptanciId ? `/toptanci/${toptanciId}` : '/katalog';
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [variantIdx, setVariantIdx] = useState(0);
  const [qty, setQty] = useState({});
  const [addedMsg, setAddedMsg] = useState('');

  const addOrMergeLine = useCartStore((s) => s.addOrMergeLine);
  const cartLines = useCartStore((s) => s.items.length);
  const cartPairs = useCartStore((s) => s.getTotalPairs());
  const wishToggle = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.items.some((i) => i.productId === productId));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const p = await getProductById(productId, toptanciId);
        if (cancelled) return;
        if (!p) {
          setError('Ürün bulunamadı veya artık satışta değil.');
          setProduct(null);
        } else {
          setProduct(p);
        }
      } catch {
        if (!cancelled) setError('Ürün yüklenemedi.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, toptanciId]);

  const variant = product?.variants?.[variantIdx];
  const sizes = useMemo(() => sizeKeysFromStock(variant?.stock), [variant?.stock]);

  useEffect(() => {
    if (!product) return;
    const stock = product.variants?.[variantIdx]?.stock;
    const keys = sizeKeysFromStock(stock);
    const next = {};
    keys.forEach((k) => {
      next[k] = 0;
    });
    setQty(next);
  }, [variantIdx, product?.id, product?.variants]);

  const stockFor = (size) => Number(variant?.stock?.[size] ?? 0);

  function setSizeQty(size, value) {
    const max = stockFor(size);
    const n = Math.max(0, Math.min(max, Number(value) || 0));
    setQty((q) => ({ ...q, [size]: n }));
  }

  const pairsThisLine = sumSizeQty(qty);
  const canAddCart = pairsThisLine > 0 && variant && product;

  function handleAddToCart() {
    if (!canAddCart) return;
    const sizesToAdd = {};
    for (const [k, v] of Object.entries(qty)) {
      if (Number(v) > 0) sizesToAdd[k] = Number(v);
    }
    addOrMergeLine({
      productId: product.id,
      toptanciId: product.toptanciId || '',
      productName: product.name,
      productCode: product.code || '',
      color: variant.color,
      colorHex: variant.color_hex || '#ccc',
      sizes: sizesToAdd,
      unitPrice: Number(product.price) || 0,
      image: variant.image || '',
    });
    setAddedMsg('Sepete eklendi.');
    setTimeout(() => setAddedMsg(''), 2500);
    const next = {};
    sizes.forEach((k) => {
      next[k] = 0;
    });
    setQty(next);
  }

  function handleWishlistToggle() {
    if (!product || !variant) return;
    wishToggle({
      productId: product.id,
      toptanciId: product.toptanciId || '',
      name: product.name,
      code: product.code,
      image: variant.image,
      price: product.price,
      category: product.category,
    });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="ui-card h-96 animate-pulse bg-slate-100" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="ui-card p-8 text-center">
          <p className="text-slate-700">{error || 'Ürün yok.'}</p>
          <Link to={basePath} className="ui-btn-primary mt-6 inline-flex">
            Kataloga dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <nav className="ui-breadcrumb mb-8 flex flex-wrap items-center justify-between gap-3 text-sm" aria-label="Sayfa konumu">
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <Link to={basePath}>Katalog</Link>
          <span className="text-slate-300">/</span>
          <span className="max-w-[min(100%,12rem)] truncate font-semibold text-slate-800 sm:max-w-md">
            {product.name}
          </span>
        </span>
        <Link
          to={`${basePath}/sepet`}
          className="ui-btn-secondary py-2 text-xs sm:text-sm"
        >
          Sepet
          {cartLines > 0 && (
            <span className="ml-1.5 tabular-nums text-emerald-700">({cartPairs} çift)</span>
          )}
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="ui-card ui-card-hover overflow-hidden ring-1 ring-slate-100">
          <div className="aspect-square bg-slate-100">
            {variant?.image ? (
              <img src={variant.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">Görsel yok</div>
            )}
          </div>
        </div>

        <div>
          <p className="ui-kicker">{categoryLabel(product.category)}</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl sm:leading-tight">
            {product.name}
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">Ürün kodu: {product.code}</p>
          {showPrice && typeof product.price === 'number' && (
            <p className="mt-4 text-2xl font-semibold tabular-nums text-slate-900">
              {product.price.toLocaleString('tr-TR')} ₺ <span className="text-sm font-normal text-slate-500">/ çift</span>
            </p>
          )}

          <div className="mt-6">
            <p className="text-sm font-medium text-slate-700">Renk</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.variants?.map((v, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setVariantIdx(i)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                    variantIdx === i
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span
                    className="h-5 w-5 rounded-full border border-slate-200"
                    style={{ backgroundColor: v.color_hex || '#ccc' }}
                  />
                  {v.color}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm font-medium text-slate-700">Beden ve adet</p>
            <p className="mt-1 text-xs text-slate-500">Stoğu biten bedenler seçilemez.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {sizes.map((sz) => {
                const max = stockFor(sz);
                const disabled = max <= 0;
                return (
                  <label
                    key={sz}
                    className={`rounded-xl border px-3 py-2 ${disabled ? 'border-slate-100 bg-slate-50 opacity-60' : 'border-slate-200 bg-white'}`}
                  >
                    <span className="text-xs font-medium text-slate-500">Beden {sz}</span>
                    <span className="ml-2 text-xs text-slate-400">(stok {max})</span>
                    <input
                      type="number"
                      min={0}
                      max={max}
                      disabled={disabled}
                      value={qty[sz] ?? 0}
                      onChange={(e) => setSizeQty(sz, e.target.value)}
                      className="ui-input mt-1 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              disabled={!canAddCart}
              onClick={handleAddToCart}
              className="ui-btn-primary disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:bg-slate-300"
            >
              Sepete ekle
            </button>
            <button
              type="button"
              onClick={handleWishlistToggle}
              className={`inline-flex items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
                inWishlist
                  ? 'border-amber-300 bg-amber-50 text-amber-900'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-amber-200 hover:bg-amber-50/50'
              }`}
            >
              {inWishlist ? 'Listeden çıkar' : 'Listeye ekle'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`${basePath}/listem`)}
              className="ui-btn-ghost justify-center sm:ml-0"
            >
              Listemi aç
            </button>
            <Link
              to={`${basePath}/sepet`}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:border-emerald-300"
            >
              Sepet sayfası
            </Link>
          </div>
          {addedMsg && (
            <p className="mt-3 text-sm font-medium text-emerald-700" role="status">
              {addedMsg}
            </p>
          )}
        </div>
      </div>

      <section className="mt-12 ui-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Ürün ve stok (tüm renkler)</h2>
        <p className="mt-1 text-sm text-slate-600">
          Kod: <strong className="font-medium text-slate-800">{product.code}</strong> · Kategori:{' '}
          {categoryLabel(product.category)}
        </p>
        <div className="mt-6 space-y-6">
          {product.variants?.map((v, vi) => (
            <div key={vi} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2">
                <span
                  className="h-4 w-4 rounded-full border border-slate-200"
                  style={{ backgroundColor: v.color_hex || '#ccc' }}
                />
                <h3 className="font-semibold text-slate-900">{v.color}</h3>
              </div>
              <ul className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
                {Object.entries(v.stock || {})
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([sz, st]) => (
                    <li
                      key={sz}
                      className="flex items-center justify-between px-4 py-2.5 text-sm"
                    >
                      <span className="text-slate-600">
                        Beden <span className="font-semibold text-slate-900">{sz}</span>
                      </span>
                      <span className="tabular-nums text-slate-800">
                        {Number(st) > 0 ? `${st} adet stokta` : 'Stok yok'}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
