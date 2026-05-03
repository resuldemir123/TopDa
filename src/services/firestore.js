import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuthStore } from '../store/useAuthStore';

function currentToptanciId() {
  const envId = String(import.meta.env.VITE_TOPTANCI_ID || '').trim();
  return envId || useAuthStore.getState().user?.uid || '';
}

export function getCurrentToptanciId() {
  return currentToptanciId();
}

export async function getToptanciProfile(toptanciId = currentToptanciId()) {
  if (!toptanciId) return null;
  const snap = await getDoc(doc(db, 'isletmeler', toptanciId));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (data.tip !== 'toptanci') return null;
  return { id: snap.id, ...data };
}

export async function saveToptanciProfile(toptanciId, profile) {
  if (!toptanciId) throw new Error('missing-toptanci-id');
  await setDoc(
    doc(db, 'isletmeler', toptanciId),
    {
      ...profile,
      tip: 'toptanci',
      email: String(profile.email || '').trim(),
      firmaAdi: String(profile.firmaAdi || '').trim(),
      yetkiliAdi: String(profile.yetkiliAdi || '').trim(),
      telefon: String(profile.telefon || '').trim(),
      whatsapp: String(profile.whatsapp || '').trim(),
      siteUrl: String(profile.siteUrl || '').trim(),
      updated_at: serverTimestamp(),
    },
    { merge: true }
  );
}

/** Katalog listesi: yalnızca belirtilen toptancıya ait aktif ürünler. ID yoksa boş dönür (tüm ürünleri sızdırmaz). */
export async function getProducts(toptanciId) {
  const id = String(toptanciId ?? '').trim();
  if (!id) return [];
  const q = query(
    collection(db, 'products'),
    where('is_active', '==', true),
    where('toptanciId', '==', id)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAdminProducts() {
  const user = useAuthStore.getState().user;
  const filters = user?.uid ? [where('toptanciId', '==', user.uid)] : [];
  const q = query(collection(db, 'products'), ...filters);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getProductById(id, toptanciId = '') {
  const ref = doc(db, 'products', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  if (data.is_active === false) return null;
  if (toptanciId && data.toptanciId !== toptanciId) return null;
  return { id: snap.id, ...data };
}

export async function createOrder(orderData) {
  const toptanciId = orderData.toptanciId || orderData.items?.[0]?.toptanciId || currentToptanciId();
  let profile = null;
  try {
    profile = await getToptanciProfile(toptanciId);
  } catch {
    profile = null;
  }
  const user = useAuthStore.getState().user;
  const ref = await addDoc(collection(db, 'orders'), {
    toptanciId,
    customer_uid: user?.uid || null,
    toptanci_info: profile
      ? {
        firmaAdi: profile.firmaAdi || '',
        whatsapp: profile.whatsapp || '',
        telefon: profile.telefon || '',
        siteUrl: profile.siteUrl || '',
      }
      : null,
    customer_info: orderData.customer,
    items: orderData.items,
    total_pairs: orderData.totalPairs,
    total_amount: orderData.totalAmount,
    status: 'pending',
    wa_notified: false,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  return ref.id;
}

export async function saveProduct(productId, productData) {
  const user = useAuthStore.getState().user;
  const payload = {
    ...productData,
    price: Number(productData.price) || 0,
    is_active: productData.is_active !== false,
    toptanciId: productData.toptanciId || user?.uid || currentToptanciId(),
    updated_at: serverTimestamp(),
  };

  if (productId) {
    await updateDoc(doc(db, 'products', productId), payload);
    return productId;
  }

  const ref = doc(collection(db, 'products'));
  await setDoc(ref, {
    ...payload,
    created_at: serverTimestamp(),
  });
  return ref.id;
}

export async function deactivateProduct(productId) {
  await updateDoc(doc(db, 'products', productId), {
    is_active: false,
    updated_at: serverTimestamp(),
  });
}

export async function updateOrderStatus(orderId, newStatus) {
  await updateDoc(doc(db, 'orders', orderId), {
    status: newStatus,
    updated_at: serverTimestamp(),
  });
}

export function ordersQuery() {
  const user = useAuthStore.getState().user;
  const filters = user?.uid ? [where('toptanciId', '==', user.uid)] : [];
  return query(collection(db, 'orders'), ...filters, orderBy('created_at', 'desc'));
}

export async function getStoreOrders(uid) {
  if (!uid) return [];
  const q = query(
    collection(db, 'orders'),
    where('customer_uid', '==', uid),
    orderBy('created_at', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Mağaza sahibi profili (doc id = Firebase Auth uid) */
export async function getMagazaSahibiProfile(uid) {
  if (!uid) return null;
  const snap = await getDoc(doc(db, 'isletmeler', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (data.tip !== 'magaza') return null;
  return { id: snap.id, ...data };
}

export async function saveMagazaSahibiBasvuru(uid, data) {
  if (!uid) throw new Error('missing-uid');
  await setDoc(doc(db, 'isletmeler', uid), {
    tip: 'magaza',
    email: String(data.email || '').trim(),
    magazaAdi: String(data.magazaAdi || '').trim(),
    yetkiliAdi: String(data.yetkiliAdi || '').trim(),
    telefon: String(data.telefon || '').trim(),
    adres: String(data.adres || '').trim(),
    not: String(data.not || '').trim(),
    status: 'pending',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
}

export async function listPendingMagazaBasvurulari() {
  const q = query(
    collection(db, 'isletmeler'),
    where('tip', '==', 'magaza'),
    where('status', '==', 'pending'),
    orderBy('created_at', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function reviewMagazaBasvurusu(magazaUid, decision, reviewerUid, redNedeni = '') {
  if (!magazaUid || !reviewerUid || !['approved', 'rejected'].includes(decision)) {
    throw new Error('invalid-review');
  }
  await updateDoc(doc(db, 'isletmeler', magazaUid), {
    status: decision,
    reviewed_at: serverTimestamp(),
    reviewed_by_uid: reviewerUid,
    red_nedeni: decision === 'rejected' ? String(redNedeni || '').trim() : '',
    updated_at: serverTimestamp(),
  });
}

/** Toptancı kaydı sonrası paylaşım kodu (benzersiz olması için birkaç deneme) */
export async function ensureToptanciDavetKodu(toptanciId, generateFn) {
  const maxTry = 8;
  for (let i = 0; i < maxTry; i++) {
    const code = generateFn();
    const q = query(collection(db, 'isletmeler'), where('tip', '==', 'toptanci'), where('davetKodu', '==', code));
    const snap = await getDocs(q);
    if (snap.empty) {
      await updateDoc(doc(db, 'isletmeler', toptanciId), {
        davetKodu: code,
        updated_at: serverTimestamp(),
      });
      return code;
    }
  }
  throw new Error('davet-kodu-uretilemedi');
}

export async function getToptanciByCode(code) {
  if (!code) return null;
  const q = query(
    collection(db, 'isletmeler'),
    where('tip', '==', 'toptanci'),
    where('davetKodu', '==', code.trim())
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}
