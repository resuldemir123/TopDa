import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Aynı Firebase Auth ile hem toptancı hem mağaza teorik; pratikte kayıt tek tipte.
 * @returns {{ isToptanci: boolean, isMagaza: boolean, magazaStatus: string|null, magazaProfile: object|null }}
 */
export async function resolveAuthRole(user) {
  if (!user?.uid) {
    return { isToptanci: false, isMagaza: false, magazaStatus: null, magazaProfile: null };
  }
  const snap = await getDoc(doc(db, 'isletmeler', user.uid));
  
  if (!snap.exists()) {
    return { isToptanci: false, isMagaza: false, magazaStatus: null, magazaProfile: null };
  }

  const data = snap.data();
  const isToptanci = data.tip === 'toptanci';
  const isMagaza = data.tip === 'magaza';
  const magazaStatus = isMagaza ? data.status || 'pending' : null;
  const magazaProfile = isMagaza ? { id: snap.id, ...data } : null;

  return { isToptanci, isMagaza, magazaStatus, magazaProfile };
}
