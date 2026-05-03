// Firestore'da toptancilar koleksiyonu ile ilgili işlemler
import { addDoc, collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

function normalizeToptanci(id, data) {
  return {
    id,
    ...data,
    name: data.firmaAdi || data.name || 'Toptanci',
    waNumber: data.whatsapp || data.waNumber || '',
    siteUrl: data.siteUrl || '',
  };
}

// Yeni toptancı ekle
export async function addToptanci({ name, siteUrl, waNumber }) {
  const ref = await addDoc(collection(db, 'toptancilar'), {
    name,
    siteUrl,
    waNumber,
    createdAt: new Date(),
  });
  return ref.id;
}

// Tüm toptancıları getir
export async function getToptancilar() {
  const snap = await getDocs(collection(db, 'toptancilar'));
  return snap.docs.map((d) => normalizeToptanci(d.id, d.data()));
}

// ID ile toptancı getir
export async function getToptanciById(id) {
  const ref = doc(db, 'toptancilar', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return normalizeToptanci(snap.id, snap.data());
}
