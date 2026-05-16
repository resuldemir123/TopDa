import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const required = [
  ['VITE_FIREBASE_API_KEY', import.meta.env.VITE_FIREBASE_API_KEY],
  ['VITE_FIREBASE_AUTH_DOMAIN', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN],
  ['VITE_FIREBASE_PROJECT_ID', import.meta.env.VITE_FIREBASE_PROJECT_ID],
  ['VITE_FIREBASE_STORAGE_BUCKET', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET],
  ['VITE_FIREBASE_MESSAGING_SENDER_ID', import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID],
  ['VITE_FIREBASE_APP_ID', import.meta.env.VITE_FIREBASE_APP_ID],
];

const missing = required.filter(([, v]) => !v || String(v).trim() === '');
if (missing.length > 0) {
  throw new Error(
    `[Firebase] Eksik ortam değişkenleri: ${missing.map(([k]) => k).join(', ')}\n` +
      'Proje kökünde .env dosyası oluşturun (.env.example dosyasını kopyalayın), Firebase Console > Project settings > Your apps bölümündeki web uygulaması yapılandırmasını yapıştırın.\n' +
      'Değişiklikten sonra geliştirme sunucusunu durdurup tekrar "npm run dev" çalıştırın.'
  );
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const measurementId = String(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '').trim();
if (measurementId) {
  firebaseConfig.measurementId = measurementId;
}

let app;
try {
  app = initializeApp(firebaseConfig);
} catch (e) {
  const code = e?.code ?? '';
  const msg = String(e?.message ?? '');
  if (code === 'auth/invalid-api-key' || msg.includes('invalid-api-key')) {
    throw new Error(
      '[Firebase] API anahtarı geçersiz. Firebase Console → Project settings → Your apps → Web uygulamasındaki apiKey değerini .env içindeki VITE_FIREBASE_API_KEY olarak yapıştırın. Başka projeye ait anahtar kullanmayın; değişiklikten sonra "npm run dev" ile yeniden başlatın.'
    );
  }
  throw e;
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/** Tarayıcıda ve measurementId tanımlıyken Analytics; aksi halde undefined */
export const analytics =
  typeof window !== 'undefined' && measurementId ? getAnalytics(app) : undefined;
