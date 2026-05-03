# Firestore Koleksiyon Yapısı

## 1. Toptancılar Koleksiyonu

Her toptancı için bir belge tutulur. Örnek belge yapısı:

```
toptancilar (koleksiyon)
  └── {toptanciId} (belge)
        - name: "Toptancı Adı"
        - siteUrl: "https://toptanci.com"
        - waNumber: "905XXXXXXXXX"
        - ... (diğer bilgiler)
```

## 2. Ürünler Alt Koleksiyonu

Her toptancının kendi ürünleri, kendi belgesinin altında alt koleksiyon olarak tutulur:

```
toptancilar (koleksiyon)
  └── {toptanciId} (belge)
        └── products (alt koleksiyon)
              └── {productId} (belge)
                    - name: "Ürün Adı"
                    - price: 100
                    - ... (diğer ürün alanları)
```

## 3. Kod ile Ekleme

```js
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const toptanciId = 'toptanci1';
const product = { name: 'Ürün Adı', price: 100 };
await addDoc(collection(db, 'toptancilar', toptanciId, 'products'), product);
```

## 4. Kod ile Listeleme

```js
import { collection, getDocs } from 'firebase/firestore';
const q = collection(db, 'toptancilar', toptanciId, 'products');
const snap = await getDocs(q);
const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
```

## 5. Avantajlar
- Her toptancının ürünleri kendi altında tutulur.
- Yetkilendirme ve sorgulama kolaylaşır.
- Firestore kuralları ile güvenli erişim sağlanır.
