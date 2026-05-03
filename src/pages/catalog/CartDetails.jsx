import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { sumSizeQty } from '../../utils/cartMath';
import { cartItemsForToptanci } from '../../utils/cartScope';

const showPrice = import.meta.env.VITE_SHOW_PRICE !== 'false';

function sizeRows(sizes) {
  if (!sizes || typeof sizes !== 'object') return [];
  return Object.entries(sizes)
    .filter(([, q]) => Number(q) > 0)
    .sort(([a], [b]) => Number(a) - Number(b));
}

export default function CartDetails() {
  const { toptanciId } = useParams();
  const basePath = toptanciId ? `/toptanci/${toptanciId}` : '/katalog';
  const allItems = useCartStore((s) => s.items);
  const items = useMemo(() => cartItemsForToptanci(allItems, toptanciId), [allItems, toptanciId]);
  const removeItem = useCartStore((s) => s.removeItem);
  const totalPairs = useCartStore((s) =>
    toptanciId ? s.getTotalPairsForToptanci(toptanciId) : s.getTotalPairs()
  );
  const totalAmount = useCartStore((s) =>
    toptanciId ? s.getTotalAmountForToptanci(toptanciId) : s.getTotalAmount()
  );
  const empty = items.length === 0;
  const hasOtherToptanciItems =
    Boolean(toptanciId) && allItems.length > 0 && items.length === 0;

  if (empty) {
    return (
      <div className="ui-card p-10 text-center">
        <p className="font-medium text-slate-800">
          {hasOtherToptanciItems
            ? 'Bu toptancı için sepetinizde ürün yok'
            : 'Sepetiniz boş'}
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          {hasOtherToptanciItems
            ? 'Başka bir toptancının kataloğundan eklediğiniz ürünler bu sayfada gösterilmez. O kataloğun sepetine geçebilir veya buradan alışverişe devam edebilirsiniz.'
            : 'Katalogdan ürün seçip detay sayfasında beden ve adet belirleyerek sepete ekleyebilirsiniz.'}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to={basePath} className="ui-btn-primary inline-flex">
            Kataloga git
          </Link>
          {hasOtherToptanciItems && (
            <Link to="/katalog" className="inline-flex rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:border-emerald-300">
              Toptancı değiştir
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <ol className="space-y-6">
        {items.map((line) => {
          const index = allItems.findIndex(
            (i) =>
              i.productId === line.productId &&
              i.color === line.color &&
              String(i.toptanciId || '') === String(line.toptanciId || '')
          );
          const pairs = sumSizeQty(line.sizes);
          const rows = sizeRows(line.sizes);
          return (
            <li key={`${line.productId}-${line.color}-${index}-${line.toptanciId || ''}`} className="ui-card overflow-hidden">
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-6 sm:p-5">
                <Link
                  to={`${basePath}/urun/${line.productId}`}
                  className="mx-auto shrink-0 sm:mx-0"
                >
                  <div className="h-36 w-36 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-28">
                    {line.image ? (
                      <img
                        src={line.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-400">
                        Görsel yok
                      </div>
                    )}
                  </div>
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`${basePath}/urun/${line.productId}`}
                        className="text-lg font-semibold text-slate-900 hover:text-emerald-700"
                      >
                        {line.productName}
                      </Link>
                      {line.productCode && (
                        <p className="mt-0.5 text-sm text-slate-500">Ürün kodu: {line.productCode}</p>
                      )}
                      <p className="mt-2 text-sm text-slate-600">
                        Renk:{' '}
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="inline-block h-4 w-4 rounded-full border border-slate-200"
                            style={{ backgroundColor: line.colorHex || '#ccc' }}
                          />
                          <span className="font-medium text-slate-800">{line.color}</span>
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="shrink-0 text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Bu kalemi kaldır
                    </button>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Beden · adet (tek tek)
                    </p>
                    <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
                      {rows.map(([size, qty]) => (
                        <li
                          key={size}
                          className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                        >
                          <span className="text-slate-600">
                            Beden <span className="font-semibold text-slate-900">{size}</span>
                          </span>
                          <span className="tabular-nums font-medium text-slate-900">{qty} adet</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                    <p className="text-sm text-slate-600">
                      Bu kalem toplam: <strong className="text-slate-900">{pairs} çift</strong>
                    </p>
                    {showPrice && (
                      <div className="text-right">
                        {Number(line.unitPrice) > 0 && (
                          <p className="text-xs text-slate-500">
                            Birim: {Number(line.unitPrice).toLocaleString('tr-TR')} ₺ / çift
                          </p>
                        )}
                        <p className="text-base font-semibold tabular-nums text-emerald-800">
                          Satır tutarı: {(line.subtotal || 0).toLocaleString('tr-TR')} ₺
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="ui-card mt-8 border-emerald-100/60 p-5 sm:p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Sepet özeti</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Kalem sayısı</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{items.length}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Toplam çift</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{totalPairs}</dd>
          </div>
          {showPrice && (
            <div className="rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">
              <dt className="text-xs font-medium uppercase tracking-wide text-emerald-800">Genel tutar</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums text-emerald-900">
                {totalAmount.toLocaleString('tr-TR')} ₺
              </dd>
            </div>
          )}
        </dl>
      </div>
    </>
  );
}
