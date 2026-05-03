import { useEffect, useMemo, useState } from 'react';
import {
  deactivateProduct,
  getAdminProducts,
  saveProduct,
} from '../../services/firestore';
import { countProducts, seedSampleProducts } from '../../services/seedProducts';

const SIZE_PRESETS = {
  female: ['36', '37', '38', '39', '40'],
  male: ['40', '41', '42', '43', '44', '45'],
  all: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
};

function sizesToRows(sizes) {
  return sizes.map((size) => ({ size, qty: 0 }));
}

const emptyForm = {
  id: '',
  name: '',
  code: '',
  category: 'unisex',
  price: '',
  is_active: true,
  variants: [
    {
      color: 'Siyah',
      color_hex: '#111827',
      image: '',
      stockRows: sizesToRows(SIZE_PRESETS.all),
    },
  ],
};

function cloneEmptyForm() {
  return {
    ...emptyForm,
    variants: emptyForm.variants.map((variant) => ({
      ...variant,
      stockRows: variant.stockRows.map((row) => ({ ...row })),
    })),
  };
}

function productToForm(product) {
  const variants = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants.map((variant) => ({
        color: variant.color || '',
        color_hex: variant.color_hex || '#cccccc',
        image: variant.image || '',
        stockRows: Object.entries(variant.stock || {})
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([size, qty]) => ({ size, qty: Number(qty) || 0 })),
      }))
    : cloneEmptyForm().variants;

  return {
    id: product.id,
    name: product.name || '',
    code: product.code || '',
    category: product.category || 'unisex',
    price: String(product.price ?? ''),
    is_active: product.is_active !== false,
    variants,
  };
}

function createVariant() {
  return {
    color: '',
    color_hex: '#cccccc',
    image: '',
    stockRows: sizesToRows(SIZE_PRESETS.all),
  };
}

function normalizeVariants(variants) {
  if (!Array.isArray(variants) || variants.length === 0) {
    throw new Error('variants-empty');
  }

  return variants.map((variant) => {
    const stock = {};
    for (const row of variant.stockRows || []) {
      const size = String(row.size || '').trim();
      if (!size) continue;
      stock[size] = Math.max(0, Number(row.qty) || 0);
    }
    if (!String(variant.color || '').trim()) throw new Error('variant-color');
    if (Object.keys(stock).length === 0) throw new Error('variant-stock');
    return {
      color: String(variant.color || '').trim(),
      color_hex: String(variant.color_hex || '#cccccc').trim(),
      image: String(variant.image || '').trim(),
      stock,
    };
  });
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(() => cloneEmptyForm());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  const activeCount = useMemo(
    () => products.filter((product) => product.is_active !== false).length,
    [products]
  );

  async function loadProducts() {
    setLoading(true);
    try {
      const list = await getAdminProducts();
      setProducts(
        list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'tr'))
      );
    } catch (e) {
      setStatus({
        type: 'err',
        text:
          e?.code === 'permission-denied'
            ? 'Urunleri okuma izni yok. Yonetici girisini ve Firestore kurallarini kontrol edin.'
            : 'Urunler yuklenemedi.',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateVariant(index, field, value) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [field]: value } : variant
      ),
    }));
  }

  function addVariant() {
    setForm((current) => ({
      ...current,
      variants: [...current.variants, createVariant()],
    }));
  }

  function removeVariant(index) {
    setForm((current) => {
      if (current.variants.length === 1) return current;
      return {
        ...current,
        variants: current.variants.filter((_, variantIndex) => variantIndex !== index),
      };
    });
  }

  function updateStockRow(variantIndex, rowIndex, field, value) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, currentVariantIndex) => {
        if (currentVariantIndex !== variantIndex) return variant;
        return {
          ...variant,
          stockRows: variant.stockRows.map((row, currentRowIndex) =>
            currentRowIndex === rowIndex ? { ...row, [field]: value } : row
          ),
        };
      }),
    }));
  }

  function addStockRow(variantIndex) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, currentVariantIndex) =>
        currentVariantIndex === variantIndex
          ? { ...variant, stockRows: [...variant.stockRows, { size: '', qty: 0 }] }
          : variant
      ),
    }));
  }

  function applySizePreset(variantIndex, presetName) {
    const sizes = SIZE_PRESETS[presetName] || SIZE_PRESETS.all;
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, currentVariantIndex) => {
        if (currentVariantIndex !== variantIndex) return variant;
        const existingQtyBySize = Object.fromEntries(
          variant.stockRows.map((row) => [String(row.size || '').trim(), row.qty])
        );
        return {
          ...variant,
          stockRows: sizes.map((size) => ({
            size,
            qty: existingQtyBySize[size] ?? 0,
          })),
        };
      }),
    }));
  }

  function removeStockRow(variantIndex, rowIndex) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, currentVariantIndex) => {
        if (currentVariantIndex !== variantIndex || variant.stockRows.length === 1) return variant;
        return {
          ...variant,
          stockRows: variant.stockRows.filter((_, currentRowIndex) => currentRowIndex !== rowIndex),
        };
      }),
    }));
  }

  function resetForm() {
    setForm(cloneEmptyForm());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const variants = normalizeVariants(form.variants);
      await saveProduct(form.id || null, {
        name: form.name.trim(),
        code: form.code.trim(),
        category: form.category,
        price: Number(form.price),
        is_active: form.is_active,
        variants,
      });
      setStatus({ type: 'ok', text: form.id ? 'Urun guncellendi.' : 'Urun eklendi.' });
      resetForm();
      await loadProducts();
    } catch (e) {
      setStatus({
        type: 'err',
        text:
          e.message === 'variant-color'
            ? 'Her renk icin renk adi girin.'
            : e.message === 'variant-stock'
              ? 'Her renk icin en az bir beden girin.'
              : 'Urun kaydedilemedi. Bilgileri ve izinleri kontrol edin.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleSeed() {
    const existing = await countProducts();
    if (existing > 0) {
      const ok = window.confirm(
        `Veritabaninda ${existing} urun kaydi var. Ornek urunler eklenirse liste buyur. Devam edilsin mi?`
      );
      if (!ok) return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const ids = await seedSampleProducts();
      setStatus({ type: 'ok', text: `${ids.length} ornek urun eklendi.` });
      await loadProducts();
    } catch (e) {
      setStatus({
        type: 'err',
        text:
          e?.code === 'permission-denied'
            ? 'Yazma izni yok. Yonetici olarak giris yaptiginizdan emin olun.'
            : 'Urunler eklenemedi.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleDeactivate(product) {
    const ok = window.confirm(`${product.name} katalogdan kaldirilsin mi?`);
    if (!ok) return;
    setBusy(true);
    setStatus(null);
    try {
      await deactivateProduct(product.id);
      setStatus({ type: 'ok', text: 'Urun pasife alindi.' });
      await loadProducts();
    } catch {
      setStatus({ type: 'err', text: 'Urun pasife alinamadi.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Urun yonetimi</h1>
        <p className="mt-1 text-sm text-slate-600">
          {products.length} urun kaydi, {activeCount} aktif katalog urunu.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(460px,560px)]">
        <section className="ui-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">Urunler</h2>
            <button
              type="button"
              disabled={busy}
              onClick={handleSeed}
              className="ui-btn-ghost disabled:cursor-not-allowed disabled:opacity-60"
            >
              Ornek urunleri yukle
            </button>
          </div>

          {loading ? (
            <div className="h-64 animate-pulse bg-slate-100" />
          ) : products.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500">
              Henuz urun yok. Sag taraftaki formdan urun ekleyin.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {products.map((product) => (
                <li key={product.id} className="px-5 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{product.name}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            product.is_active === false
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {product.is_active === false ? 'Pasif' : 'Aktif'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {product.code || 'Kod yok'} · {product.category || 'unisex'} ·{' '}
                        {Number(product.price || 0).toLocaleString('tr-TR')} TL
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {(product.variants || []).length} varyant
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setForm(productToForm(product))}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Duzenle
                      </button>
                      <button
                        type="button"
                        disabled={busy || product.is_active === false}
                        onClick={() => handleDeactivate(product)}
                        className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Kaldir
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="ui-card p-5">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {form.id ? 'Urunu duzenle' : 'Yeni urun'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Renkleri ve beden stoklarini butonlarla ekleyebilirsiniz.
              </p>
            </div>
            {form.id && (
              <button type="button" onClick={resetForm} className="ui-btn-ghost">
                Yeni
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Urun adi</span>
              <input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="ui-input"
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Kod</span>
                <input
                  value={form.code}
                  onChange={(e) => updateField('code', e.target.value)}
                  className="ui-input"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Fiyat</span>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  className="ui-input"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Kategori</span>
                <select
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="ui-input"
                >
                  <option value="unisex">Unisex</option>
                  <option value="male">Erkek</option>
                  <option value="female">Kadin</option>
                </select>
              </label>
              <label className="flex items-center gap-3 pt-8 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => updateField('is_active', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Katalogda aktif
              </label>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Renkler ve beden stoklari</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Her renk icin bedenleri ve eldeki adetleri girin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  Renk ekle
                </button>
              </div>

              {form.variants.map((variant, variantIndex) => (
                <div key={variantIndex} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-6 w-6 rounded-full border border-slate-300 shadow-inner"
                        style={{ backgroundColor: variant.color_hex || '#cccccc' }}
                      />
                      <h4 className="text-sm font-semibold text-slate-900">
                        {variant.color || `Renk ${variantIndex + 1}`}
                      </h4>
                    </div>
                    <button
                      type="button"
                      disabled={form.variants.length === 1}
                      onClick={() => removeVariant(variantIndex)}
                      className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Rengi sil
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_96px]">
                    <label className="block">
                      <span className="text-xs font-medium text-slate-600">Renk adi</span>
                      <input
                        value={variant.color}
                        onChange={(e) => updateVariant(variantIndex, 'color', e.target.value)}
                        className="ui-input"
                        placeholder="Siyah"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-600">Renk</span>
                      <input
                        type="color"
                        value={variant.color_hex || '#cccccc'}
                        onChange={(e) => updateVariant(variantIndex, 'color_hex', e.target.value)}
                        className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white p-1"
                      />
                    </label>
                  </div>

                  <label className="mt-3 block">
                    <span className="text-xs font-medium text-slate-600">Gorsel linki</span>
                    <input
                      type="url"
                      value={variant.image}
                      onChange={(e) => updateVariant(variantIndex, 'image', e.target.value)}
                      className="ui-input"
                      placeholder="https://..."
                    />
                  </label>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Beden stoklari
                      </span>
                      <button
                        type="button"
                        onClick={() => addStockRow(variantIndex)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Beden ekle
                      </button>
                    </div>

                    <div className="mb-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => applySizePreset(variantIndex, 'female')}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Kadin 36-40
                      </button>
                      <button
                        type="button"
                        onClick={() => applySizePreset(variantIndex, 'male')}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Erkek 40-45
                      </button>
                      <button
                        type="button"
                        onClick={() => applySizePreset(variantIndex, 'all')}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Tum 36-45
                      </button>
                    </div>

                    <div className="space-y-2">
                      {variant.stockRows.map((row, rowIndex) => (
                        <div key={rowIndex} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                          <label className="block">
                            <span className="text-xs font-medium text-slate-600">Beden</span>
                            <input
                              value={row.size}
                              onChange={(e) =>
                                updateStockRow(variantIndex, rowIndex, 'size', e.target.value)
                              }
                              className="ui-input"
                              placeholder="40"
                              required
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs font-medium text-slate-600">Adet</span>
                            <input
                              type="number"
                              min="0"
                              value={row.qty}
                              onChange={(e) =>
                                updateStockRow(variantIndex, rowIndex, 'qty', e.target.value)
                              }
                              className="ui-input"
                              required
                            />
                          </label>
                          <button
                            type="button"
                            disabled={variant.stockRows.length === 1}
                            onClick={() => removeStockRow(variantIndex, rowIndex)}
                            className="mb-0.5 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Sil
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {status && (
              <p
                className={`rounded-xl border px-4 py-3 text-sm ${
                  status.type === 'ok'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-red-200 bg-red-50 text-red-900'
                }`}
              >
                {status.text}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="ui-btn-primary w-full disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:bg-slate-300"
            >
              {busy ? 'Kaydediliyor...' : form.id ? 'Urunu guncelle' : 'Urun ekle'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
