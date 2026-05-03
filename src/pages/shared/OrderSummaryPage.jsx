import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { buildWALink } from '../../services/whatsapp';

export default function OrderSummaryPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const { toptanciId } = useParams();
  const basePath = toptanciId ? `/toptanci/${toptanciId}` : '/katalog';
  const orderId = params.get('id');
  const order = location.state?.order;
  const waLink = order ? buildWALink(order) : '';

  return (
    <div className="min-h-screen bg-slate-50 bg-page-mesh px-4 py-12 sm:py-20">
      <div className="mx-auto max-w-md">
        <div className="ui-card overflow-hidden shadow-card ring-1 ring-emerald-100/50">
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 px-6 py-12 text-center text-white">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm">
              <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Siparişiniz alındı</h1>
            <p className="mt-3 text-sm leading-relaxed text-emerald-50">
              Kayıt oluşturuldu. İsterseniz WhatsApp ile toptancıya mesaj gönderebilirsiniz.
            </p>
          </div>
          <div className="px-6 py-8">
            {orderId && (
              <p className="text-center text-sm text-slate-600">
                Sipariş numaranız:{' '}
                <span className="font-bold tabular-nums text-slate-900">#{orderId}</span>
              </p>
            )}
            {waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ui-btn-primary mt-6 w-full"
              >
                WhatsApp mesajını aç
              </a>
            ) : (
              <p className="mt-4 text-center text-sm leading-relaxed text-slate-500">
                WhatsApp bağlantısı sepetten tamamlanan siparişlerde otomatik hazırlanır.
              </p>
            )}
            <Link to={basePath} className="ui-btn-secondary mt-4 w-full justify-center">
              Kataloga dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
