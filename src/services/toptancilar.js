import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
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

export async function addToptanci() {
  throw new Error('client-toptanci-create-disabled');
}

export async function getToptancilar() {
  const snap = await getDocs(query(collection(db, 'isletmeler'), where('tip', '==', 'toptanci')));
  return snap.docs.map((d) => normalizeToptanci(d.id, d.data()));
}

export async function getToptanciById(id) {
  const snap = await getDoc(doc(db, 'isletmeler', id));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (data.tip !== 'toptanci') return null;
  return normalizeToptanci(snap.id, data);
}
