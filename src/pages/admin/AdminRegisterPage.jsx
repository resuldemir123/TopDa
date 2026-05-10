import { Link } from 'react-router-dom';

export default function AdminRegisterPage() {
  return (
    <div className="min-h-screen bg-slate-900 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link to="/admin" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
            Toptanci girisine don
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Toptanci kaydi kapali</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Production guvenligi icin tarayicidan toptanci hesabi olusturma kapatildi.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 shadow-xl sm:p-6">
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm leading-relaxed text-amber-100">
            Toptanci hesabi artik sadece guvenilir bir admin islemiyle acilmali. Bu sayfada daha once
            kullanilan davet veya master anahtar kontrolu frontend kodunda calisiyordu; frontend kodu
            kullaniciya indigi icin bu anahtar gizli kabul edilemez.
          </div>

          <div className="mt-6 space-y-3 text-sm leading-relaxed text-slate-300">
            <p>
              Yeni toptanci eklemek icin Firebase Console, Admin SDK veya Cloud Function gibi guvenilir
              server tarafli bir akis kullanin.
            </p>
            <p>
              Olusturulan kullanicinin Firestore belgesi <span className="font-mono">isletmeler/&lt;uid&gt;</span>{' '}
              yolunda <span className="font-mono">tip: "toptanci"</span> olarak bulunmalidir.
            </p>
          </div>

          <Link
            to="/admin"
            className="mt-8 inline-flex w-full justify-center rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-500"
          >
            Giris sayfasina git
          </Link>
        </div>
      </div>
    </div>
  );
}
