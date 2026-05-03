# TopDa 👟 | Yeni Nesil B2B Toptan Ticaret Platformu

**TopDa**, geleneksel toptan ticaretin karmaşasını WhatsApp'ın hızı ve dijital dünyanın gücüyle birleştiren modern bir B2B ekosistemidir. Toptancılar ve perakende mağazalar arasındaki sipariş süreçlerini dijitalleştirerek işletmenizi büyüten bir avantaja dönüştürür.

---

## 🚀 Öne Çıkan Özellikler

### 🏢 Toptancılar İçin
- **Ürün Yönetimi:** Dijital katalog oluşturma, varyant (renk/beden) ve stok yönetimi.
- **Sipariş Takibi:** Gelen siparişleri anlık olarak panel üzerinden izleme ve durum (Hazırlanıyor, Kargoda vb.) güncelleme.
- **Mağaza Onay Sistemi:** Sadece onayladığınız mağazaların kataloğunuzu görmesini sağlayarak ticari güvenliği koruma.
- **Davet Kodu:** Özel davet kodları ile bayi ağınızı hızla genişletme.

### 🏪 Mağazalar İçin
- **Dijital Katalog:** Toptancıların güncel stok ve fiyatlarını anlık takip etme.
- **Hızlı Sipariş:** WhatsApp entegrasyonu ile saniyeler içinde sepet oluşturma ve iletme.
- **Sipariş Geçmişi:** Geçmiş tüm alımları detaylıca görebilme ve kargo durumunu takip etme.
- **Kodla Katıl:** Toptancılardan gelen özel kodlarla yeni kataloglara anında erişim.

---

## 🛠️ Teknoloji Yığını

- **Frontend:** React.js, Tailwind CSS
- **State Management:** Zustand
- **Backend & Veritabanı:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Routing:** React Router DOM v6
- **Styling:** Modern UI/UX prensipleri, Manrope & Inter Fontları

---

## ⚙️ Kurulum ve Çalıştırma

1.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

2.  **Çevresel Değişkenleri Ayarlayın:**
    `.env.example` dosyasını `.env` olarak kopyalayın ve Firebase anahtarlarınızı girin.

3.  **Uygulamayı Başlatın:**
    ```bash
    npm run dev
    ```

---

## 🔒 Firebase Yapılandırması

Sistemin tam performanslı çalışması için şu ayarların yapılması gereklidir:

### 📄 Firestore Kuralları (Rules)
`orders` ve `isletmeler` koleksiyonları için role-based access control (RBAC) kurallarının yayınlanması şarttır. Proje kök dizinindeki kuralları Firebase Console'a yapıştırın.

### ⚡ Gerekli İndeksler (Indexes)
Firestore sorgularının çalışması için şu birleşik indeksler (Composite Indexes) oluşturulmalıdır:

1.  **isletmeler:** `tip` (Asc) + `status` (Asc) + `created_at` (Desc)
2.  **isletmeler:** `tip` (Asc) + `davetKodu` (Asc)
3.  **orders:** `toptanciId` (Asc) + `created_at` (Desc)
4.  **orders:** `customer_uid` (Asc) + `created_at` (Desc)

---

## 📂 Dosya Yapısı

- `/src/pages`: Sayfa bileşenleri (Admin, Mağaza, Katalog).
- `/src/components`: Ortak Layout ve Yetkilendirme (ProtectedRoutes) yapıları.
- `/src/services`: Firestore veri servisleri.
- `/src/store`: Zustand durum yönetimi.
- `/src/utils`: Rol çözme ve yardımcı fonksiyonlar.

---

## 📜 Lisans
© 2025 TopDa · Tüm hakları saklıdır.