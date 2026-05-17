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
    customer_uid: orderData.customer_uid || user?.uid || null,
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

export function storeOrdersQuery(uid) {
  if (!uid) {
    throw new Error('missing-store-uid');
  }
  return query(collection(db, 'orders'), where('customer_uid', '==', uid), orderBy('created_at', 'desc'));
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

/** Tüm toptancıları listeler (yönetici/mağaza panelinde gösterim için) */
export async function listAllToptancilar() {
  const snap = await getDocs(query(collection(db, 'isletmeler'), where('tip', '==', 'toptanci')));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      firmaAdi: data.firmaAdi || data.name || '',
      name: data.firmaAdi || data.name || 'Toptanci',
    };
  });
}

/** Mağaza sahibinin seçtiği toptancıyı mağaza profilinin içine kaydeder */
export async function saveMagazaSelectedToptanci(magazaUid, toptanciId) {
  if (!magazaUid) throw new Error('missing-magaza-uid');
  await updateDoc(doc(db, 'isletmeler', magazaUid), {
    selectedToptanciId: toptanciId || null,
    updated_at: serverTimestamp(),
  });
}

/** 
 * B2B Bağlantı Yönetimi 
 */

// Mağaza -> Toptancı bağlantı isteği gönderir
export async function requestWholesalerConnection(storeId, wholesalerId) {
  if (!storeId || !wholesalerId) throw new Error('missing-ids');
  const connId = `${storeId}_${wholesalerId}`;
  await setDoc(doc(db, 'connections', connId), {
    storeId,
    wholesalerId,
    status: 'pending',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
}

// Bağlantı durumunu sorgular
export async function getConnection(storeId, wholesalerId) {
  if (!storeId || !wholesalerId) return null;
  const connId = `${storeId}_${wholesalerId}`;
  const snap = await getDoc(doc(db, 'connections', connId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// Toptancı: Bekleyen istekleri listeler
export async function listPendingConnections(wholesalerId) {
  const q = query(
    collection(db, 'connections'),
    where('wholesalerId', '==', wholesalerId),
    where('status', '==', 'pending'),
    orderBy('created_at', 'desc')
  );
  const snap = await getDocs(q);

  // Mağaza detaylarını da çekmek için zenginleştirme
  const results = [];
  for (const d of snap.docs) {
    const conn = d.data();
    const storeSnap = await getDoc(doc(db, 'isletmeler', conn.storeId));
    results.push({
      id: d.id,
      ...conn,
      store: storeSnap.exists() ? { id: storeSnap.id, ...storeSnap.data() } : null
    });
  }
  return results;
}

// Toptancı: İsteği onayla
export async function approveConnection(storeId, wholesalerId) {
  const connId = `${storeId}_${wholesalerId}`;
  await updateDoc(doc(db, 'connections', connId), {
    status: 'approved',
    updated_at: serverTimestamp(),
  });
}

// Mağaza: Onaylı toptancılarını listele (Navbar için)
export async function listMyWholesalers(storeId) {
  const q = query(
    collection(db, 'connections'),
    where('storeId', '==', storeId),
    where('status', '==', 'approved')
  );
  const snap = await getDocs(q);
  const results = [];
  for (const d of snap.docs) {
    const conn = d.data();
    const wSnap = await getDoc(doc(db, 'isletmeler', conn.wholesalerId));
    if (wSnap.exists()) {
      results.push({ id: wSnap.id, ...wSnap.data() });
    }
  }
  return results;
}

// Toptancı: Onaylı mağazalarımı listele
export async function listMyApprovedStores(wholesalerId) {
  const q = query(
    collection(db, 'connections'),
    where('wholesalerId', '==', wholesalerId),
    where('status', '==', 'approved')
  );
  const snap = await getDocs(q);
  const results = [];
  for (const d of snap.docs) {
    const conn = d.data();
    const sSnap = await getDoc(doc(db, 'isletmeler', conn.storeId));
    if (sSnap.exists()) {
      results.push({ id: sSnap.id, ...sSnap.data() });
    }
  }
  return results;
}
