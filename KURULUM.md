# Kurulum

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
