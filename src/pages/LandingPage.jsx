import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fb] font-sans text-[#191c1e] antialiased flex items-center justify-center relative overflow-hidden">
      {/* Arka Plan Deseni (Dot Pattern) */}
      <div className="absolute inset-0 pointer-events-none opacity-50" 
        style={{ 
          backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }} 
      />

      <main className="w-full py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-black mb-4 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Ticaretin Geleceğine Hoş Geldiniz
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              B2B Trade Platformu ile WhatsApp üzerinden sipariş süreçlerinizi dijitalleştirin. 
              İster mağaza sahibi olun, ister toptancı; <span className="font-semibold text-black">TopDa</span> sizi birbirinize bağlar.
            </p>
          </div>

          {/* Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
            
            {/* Retailer Card (Mağazacı) */}
            <div className="group bg-white rounded-2xl p-10 flex flex-col items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 hover:border-black transition-all duration-300">
              <div className="w-24 h-24 rounded-full bg-[#dae2fd] flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-[#131b2e] text-5xl">storefront</span>
              </div>
              <h2 className="text-2xl font-bold text-black mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>Mağazacı</h2>
              <p className="text-slate-600 mb-8 flex-grow leading-relaxed">
                Toptancılarınızın kataloglarını anlık görün, sepetinizi oluşturun ve tek bir tuşla WhatsApp üzerinden siparişinizi iletin. Karmaşık sistemlerle vakit kaybetmeyin.
              </p>
              <Link 
                to="/magaza/giris" 
                className="w-full py-4 bg-black text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
              >
                <span>Mağaza Girişi Yap</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <div className="mt-8 flex gap-4 grayscale opacity-30">
                <img alt="Trust" className="h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGdiFgW7pb-kGMgXmJyrvZ2YrOz_jWm0Bhdri1jWALIzSR7LouB6Zs0wSOnvFg_haiz7cl-9yknftdIMrcW_SnASdv8rmMSHRhLiuBARe3bUPjYGr7Euh_4L5BRAG-iWECKO8RuhFEPNv7dyf0zxlLo5dB2ukRRBNskU86etT8xTPYBIqrymiH-xEmd9f4rxfxRwSW2nsOsah1rCX5OZyoAo-DSmFbeSeBNuknuxepPOtFs9nFLH6Dg5Sd2L85EeajV6l8TpUDjdok"/>
              </div>
            </div>

            {/* Wholesaler Card (Toptancı) */}
            <div className="group bg-white rounded-2xl p-10 flex flex-col items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 hover:border-[#006d2f] transition-all duration-300">
              <div className="w-24 h-24 rounded-full bg-[#5dfd8a] flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-[#002109] text-5xl">warehouse</span>
              </div>
              <h2 className="text-2xl font-bold text-black mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>Toptancı</h2>
              <p className="text-slate-600 mb-8 flex-grow leading-relaxed">
                Ürünlerinizi yönetin, müşterilerinize dijital katalog sunun ve WhatsApp üzerinden gelen siparişleri profesyonel bir panelden takip edin. Satışlarınızı katlayın.
              </p>
              <Link 
                to="/admin" 
                className="w-full py-4 bg-[#006d2f] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
              >
                <span>Toptancı Girişi Yap</span>
                <span className="material-symbols-outlined">rocket_launch</span>
              </Link>
              <div className="mt-8 flex items-center gap-2 text-[#006d2f] font-semibold">
                <span className="material-symbols-outlined text-sm">bolt</span>
                <span className="text-sm">WhatsApp Business Entegrasyonu</span>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
