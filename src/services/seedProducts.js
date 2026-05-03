
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { SAMPLE_PRODUCTS } from '../data/sampleProducts';
import { db } from '../firebase/config';

// Giriş yapan kullanıcıyı almak için store fonksiyonu
import { useAuthStore } from '../store/useAuthStore';

export async function seedSampleProducts() {
  const col = collection(db, 'products');
  const ids = [];
  // Giriş yapan kullanıcı (toptancı) bilgisi
  const user = useAuthStore.getState().user;
  for (const product of SAMPLE_PRODUCTS) {
    const ref = await addDoc(col, {
      ...product,
      toptanciId: user?.uid || null,
    });
    ids.push(ref.id);
  }
  return ids;
}

export async function countProducts() {
  const snap = await getDocs(collection(db, 'products'));
  return snap.size;
}
