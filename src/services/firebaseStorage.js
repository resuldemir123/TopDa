import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, storage } from '../firebase/config';

/**
 * Ürün resimleri Firebase Storage'a yüklenir
 * @param {string} productId - Ürün dokuman ID'si (temp-{timestamp} olabilir)
 * @param {number} variantIndex - Varyant sırası (renk sırası)
 * @param {File} file - Yüklenecek resim dosyası
 * @returns {Promise<string>} Firebase Storage indirme URL'si
 */
export async function uploadProductImage(productId, variantIndex, file) {
  if (!file) throw new Error('Dosya gerekli');
  if (!file.type.startsWith('image/')) throw new Error('Geçersiz dosya tipi');
  if (file.size > 5 * 1024 * 1024) throw new Error('Dosya 5MB\'dan büyük');
  
  // Auth kontrolü
  const user = auth.currentUser;
  if (!user) throw new Error('Giriş yapmanız gerekiyor');

  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
  const storagePath = `productImages/${productId}/variant_${variantIndex}/${fileName}`;
  const storageRef = ref(storage, storagePath);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Storage upload hatası:', error);
    if (error.code === 'storage/unauthorized') {
      throw new Error('Storage yazma izni yok. Firebase kurallarını kontrol edin.');
    }
    throw error;
  }
}

/**
 * Bir ürünün tüm resimlerini siler
 * @param {string} productId - Ürün dokuman ID'si
 */
export async function deleteProductImages(productId) {
  // Not: Toplu silme yapılabilir, ancak listelemek gerekir
  // Şimdilik, individual silme ile yapılacak
  console.log(`Ürün ${productId} resimlerini silmek için Storage konsolu kullanın`);
}
