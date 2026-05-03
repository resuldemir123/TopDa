# WhatsApp Sipariş Platformu

Bu proje, WhatsApp üzerinden sipariş verebilmeyi sağlayan bir e-ticaret platformudur. React, Vite, Firebase ve Tailwind CSS kullanılarak geliştirilmiştir.

## Özellikler

- Ürün kataloğu görüntüleme
- Sepet yönetimi
- İstek listesi (Wishlist)
- Admin paneli (Sipariş yönetimi, Ürün yönetimi)
- WhatsApp entegrasyonu ile sipariş gönderme (toptancı sitesi linki dahil)
- Toptancı sitesi yönlendirmesi (özel müşteriler için)
- Firebase Firestore veritabanı

## Kurulum

1. Projeyi klonlayın:
   ```bash
   git clone <repo-url>
   cd whatsapp-siparis-platformu
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Firebase konfigürasyonunu ayarlayın:
   - `src/firebase/config.js` dosyasını düzenleyin ve Firebase proje bilgilerinizi ekleyin.
   - `.env` dosyasında `VITE_TOPTANCI_SITE_URL` değişkenini toptancı sitesi URL'si ile ayarlayın.

4. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

## Build

Üretim için build almak için:
```bash
npm run build
```

## Önizleme

Build sonrası önizleme için:
```bash
npm run preview
```

## Teknoloji Stack

- **Frontend**: React 18, React Router DOM
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **State Management**: Zustand

## Proje Yapısı

```
src/
├── components/          # Yeniden kullanılabilir bileşenler
├── pages/              # Sayfa bileşenleri
│   ├── admin/          # Admin sayfaları
│   ├── catalog/        # Katalog sayfaları
│   └── shared/         # Paylaşılan sayfalar
├── services/           # Firebase servisleri
├── store/              # Zustand store'ları
├── utils/              # Yardımcı fonksiyonlar
└── firebase/           # Firebase konfigürasyonu
```

## Sorun Giderme

- **Firebase bağlantı hatası**: `src/firebase/config.js` dosyasındaki API anahtarlarını kontrol edin.
- **Build hatası**: Node.js ve npm sürümlerini kontrol edin (Node.js >= 16, npm >= 7).
- **Styling sorunları**: Tailwind CSS konfigürasyonunu kontrol edin.

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.