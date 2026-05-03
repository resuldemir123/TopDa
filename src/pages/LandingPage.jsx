import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f0f4f0] font-sans text-[#0a1a0f] antialiased relative overflow-hidden"
      style={{ fontFamily: "'Manrope', sans-serif" }}>

      {/* Dekoratif arka plan: büyük daire ve çizgiler */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full border border-emerald-200 opacity-40 pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full border border-emerald-300 opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-[300px] h-[300px] rounded-full bg-emerald-50 opacity-60 blur-3xl pointer-events-none" />

      {/* Dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'radial-gradient(#6ee7b7 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Nav bar */}
      <nav className="relative z-20 flex items-center justify-between px-8 pt-8 pb-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img src="/TopDa.png" alt="TopDa" className="h-12 w-auto object-contain drop-shadow-sm" />
          <span className="font-black text-2xl tracking-tighter text-black">TopDa</span>
        </div>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full tracking-wide uppercase">Beta</span>
      </nav>

      <main className="w-full py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6">

          {/* Hero */}
          <div className="text-center max-w-4xl mx-auto mb-24">
            {/* Etiket */}
            <div className="inline-flex items-center gap-2 bg-white border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Toptan Ticaretin Yeni Nesli
            </div>

            <h1
              className="text-5xl sm:text-7xl font-black text-black mb-6 tracking-tight leading-[1.05]"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Ticaretin sınırlarını{' '}
              <br />
              <span className="text-emerald-600 italic">yeniden çizin.</span>
            </h1>

            <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto mb-3">
              <strong className="text-black font-bold">TopDa</strong> ile WhatsApp'ın hızını dijital ticaretin gücüyle birleştirin.
              Sipariş yönetimi artık bir yük değil, işletmenizi büyüten bir avantaj.
            </p>
            <p className="text-sm text-slate-400">
              Mağaza sahipleri ve toptancılar arasındaki bağı koparılamaz kılan dijital iş ortağınız.
            </p>
          </div>

          {/* Kartlar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

            {/* Mağazacı Kartı */}
            <div className="group relative bg-white rounded-3xl p-10 flex flex-col items-start text-left shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-slate-100 hover:border-slate-300 hover:shadow-[0_16px_60px_rgba(0,0,0,0.10)] transition-all duration-500 overflow-hidden">
              {/* Dekoratif köşe */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-[6rem] bg-blue-50 opacity-60 pointer-events-none transition-all duration-500 group-hover:opacity-100" />

              <div className="w-14 h-14 rounded-2xl bg-[#dae2fd] flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[#2d4ecf] text-3xl">storefront</span>
              </div>

              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-400">Perakendeci</div>
              <h2 className="text-2xl font-black text-black mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Mağazacı
              </h2>
              <p className="text-slate-500 mb-10 flex-grow leading-relaxed text-sm">
                Toptancılarınızın kataloglarını anlık görün, sepetinizi oluşturun ve
                tek bir tuşla WhatsApp üzerinden siparişinizi iletin.
              </p>

              <Link
                to="/magaza/giris"
                className="w-full py-4 bg-[#131b2e] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#1e2d47] active:scale-[0.98] transition-all shadow-lg shadow-slate-900/10"
              >
                <span>Mağaza Girişi Yap</span>
                <span className="material-symbols-outlined text-lg leading-none">arrow_forward</span>
              </Link>
            </div>

            {/* Toptancı Kartı */}
            <div className="group relative bg-[#012a14] rounded-3xl p-10 flex flex-col items-start text-left shadow-[0_8px_40px_rgba(0,109,47,0.18)] border border-emerald-900 hover:shadow-[0_16px_60px_rgba(0,109,47,0.28)] transition-all duration-500 overflow-hidden">
              {/* Parlak dekoratif blob */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-emerald-500 opacity-10 blur-2xl pointer-events-none group-hover:opacity-20 transition-opacity duration-500" />
              <div className="absolute top-0 right-0 w-28 h-28 rounded-bl-[5rem] bg-emerald-900 opacity-40 pointer-events-none" />

              <div className="w-14 h-14 rounded-2xl bg-[#5dfd8a] flex items-center justify-center mb-8 shadow-md group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[#002109] text-3xl">warehouse</span>
              </div>

              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-400">Toptan Satıcı</div>
              <h2 className="text-2xl font-black text-white mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Toptancı
              </h2>
              <p className="text-emerald-200/70 mb-10 flex-grow leading-relaxed text-sm">
                Ürünlerinizi yönetin, müşterilerinize dijital katalog sunun ve
                WhatsApp siparişlerini profesyonel bir panelden takip edin.
              </p>

              <Link
                to="/admin"
                className="w-full py-4 bg-[#5dfd8a] text-[#002109] rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#4ae070] active:scale-[0.98] transition-all shadow-lg shadow-emerald-400/20"
              >
                <span>Toptancı Girişi Yap</span>
                <span className="material-symbols-outlined text-lg leading-none">rocket_launch</span>
              </Link>
            </div>

          </div>

          {/* Neden TopDa */}
          <div className="mt-32 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 justify-center mb-14">
              <div className="h-px flex-1 bg-slate-200" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Neden TopDa?
              </h3>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: 'energy_savings_leaf',
                  color: 'bg-emerald-100 text-emerald-600',
                  title: 'Sıfır Sürtünme',
                  desc: 'WhatsApp üzerinden saniyeler içinde sipariş oluşturun ve yönetin.',
                },
                {
                  icon: 'hub',
                  color: 'bg-blue-100 text-blue-600',
                  title: 'Kesintisiz Bağlantı',
                  desc: 'Toptancı ve perakendeci arasındaki iletişimi tek noktada toplayın.',
                },
                {
                  icon: 'auto_fix_high',
                  color: 'bg-amber-100 text-amber-600',
                  title: 'Dijital Dönüşüm',
                  desc: 'Karmaşık yazılımlar olmadan bildiğiniz arayüzle ticaretinizi profesyonelleştirin.',
                },
              ].map(({ icon, color, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300 group">
                  <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <span className="material-symbols-outlined text-xl">{icon}</span>
                  </div>
                  <h4 className="font-black text-base text-black mb-2">{title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-24 text-center border-t border-slate-200 pt-12">
            <p className="text-sm text-slate-400 italic" style={{ fontFamily: "'DM Serif Display', serif" }}>
              TopDa: Toptan ticaretin en hızlı, en akıllı ve en samimi yolu.
            </p>
            <p className="mt-3 text-xs text-slate-300">© 2025 TopDa · Tüm hakları saklıdır.</p>
          </div>

        </div>
      </main>
    </div>
  );
}