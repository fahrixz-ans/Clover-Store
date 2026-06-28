import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import type { Product, Order, Mission, UserMission, Transaction, Blog, License, Promo, Review, QnA } from '@/types';
import { generateLicenseKey } from '@/utils/generateLicenseKey';
import {
  sendLicenseEmail,
  sendRejectionEmail,
} from './emailjs';
// ============================================
// PRODUCTS
// ============================================
export const getProducts = async (filters?: { kategori?: string; status?: string }) => {
  let q = query(collection(db, 'products'), where('status', '==', 'aktif'), orderBy('createdAt', 'desc'));
  
  if (filters?.kategori) {
    q = query(collection(db, 'products'), where('kategori', '==', filters.kategori), where('status', '==', 'aktif'), orderBy('createdAt', 'desc'));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const getProductBySlug = async (slug: string) => {
  const q = query(collection(db, 'products'), where('slug', '==', slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Product;
};

export const getProductById = async (id: string) => {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Product;
};

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  const q = query(collection(db, 'products'), where('status', '==', 'aktif'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    callback(products);
  });
};

// ============================================
// ORDERS
// ============================================
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, 'orders'), {
    ...orderData,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const getUserOrders = async (userId: string) => {
  const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

export const subscribeToUserOrders = (userId: string, callback: (orders: Order[]) => void) => {
  const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    callback(orders);
  });
};

export const getOrderById = async (orderId: string) => {
  const docRef = doc(db, 'orders', orderId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Order;
};

// ============================================
// MISSIONS
// ============================================
export const getMissions = async (filters?: { kategori?: string; status?: string }) => {
  let q = query(collection(db, 'missions'), where('status', '==', 'aktif'), orderBy('createdAt', 'desc'));
  
  if (filters?.kategori) {
    q = query(collection(db, 'missions'), where('kategori', '==', filters.kategori), where('status', '==', 'aktif'));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mission));
};

export const getMissionById = async (id: string) => {
  const docRef = doc(db, 'missions', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Mission;
};

// ============================================
// USER MISSIONS
// ============================================
export const takeMission = async (userId: string, mission: Mission) => {
  const now = Timestamp.now();
  const deadline = new Date();
  deadline.setMinutes(deadline.getMinutes() + mission.estimasiWaktu);
  
  const docRef = await addDoc(collection(db, 'userMissions'), {
    userId,
    missionId: mission.id,
    missionJudul: mission.judul,
    status: 'diambil',
    rewardDiterima: 0,
    rewardStatus: 'pending',
    diambilAt: now,
    deadlineAt: Timestamp.fromDate(deadline),
  });
  return docRef.id;
};

export const submitMissionProof = async (userMissionId: string, bukti: { screenshot?: string; link?: string }) => {
  const docRef = doc(db, 'userMissions', userMissionId);
  await updateDoc(docRef, {
    status: 'disubmit',
    buktiScreenshot: bukti.screenshot || null,
    buktiLink: bukti.link || null,
    disubmitAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

export const getUserMissions = async (userId: string) => {
  const q = query(collection(db, 'userMissions'), where('userId', '==', userId), orderBy('diambilAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserMission));
};

export const subscribeToUserMissions = (userId: string, callback: (missions: UserMission[]) => void) => {
  const q = query(collection(db, 'userMissions'), where('userId', '==', userId), orderBy('diambilAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const missions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserMission));
    callback(missions);
  });
};

// ============================================
// TRANSACTIONS
// ============================================
export const getUserTransactions = async (userId: string) => {
  const q = query(collection(db, 'transactions'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
};

export const subscribeToUserTransactions = (userId: string, callback: (transactions: Transaction[]) => void) => {
  const q = query(collection(db, 'transactions'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    callback(transactions);
  });
};

// ============================================
// BLOGS
// ============================================
export const getBlogs = async (filters?: { kategori?: string; status?: string }) => {
  let q = query(collection(db, 'blogs'), where('status', '==', 'published'), orderBy('publishedAt', 'desc'));
  
  if (filters?.kategori) {
    q = query(collection(db, 'blogs'), where('kategori', 'array-contains', filters.kategori), where('status', '==', 'published'));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog));
};

export const getBlogBySlug = async (slug: string) => {
  const q = query(collection(db, 'blogs'), where('slug', '==', slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Blog;
};

// ============================================
// LICENSES
// ============================================
export const getUserLicenses = async (userId: string) => {
  const q = query(collection(db, 'licenses'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as License));
};

export const redeemLicenseKey = async (licenseKey: string, userId: string) => {
  const q = query(collection(db, 'licenses'), where('licenseKey', '==', licenseKey), where('userId', '==', userId), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const licenseDoc = snapshot.docs[0];
  const license = { id: licenseDoc.id, ...licenseDoc.data() } as License;
  
  if (license.status === 'aktif') {
    return { alreadyActivated: true, license };
  }
  
  await updateDoc(doc(db, 'licenses', licenseDoc.id), {
    status: 'aktif',
    activatedAt: Timestamp.now(),
  });
  
  return { alreadyActivated: false, license };
};

// ============================================
// REVIEWS
// ============================================
export const getProductReviews = async (productId: string) => {
  const q = query(collection(db, 'reviews'), where('productId', '==', productId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
};

// ============================================
// QnA
// ============================================
export const getProductQnA = async (productId: string) => {
  const q = query(collection(db, 'qna'), where('productId', '==', productId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QnA));
};

// ============================================
// PROMOS
// ============================================
export const getActivePromos = async () => {
  const now = Timestamp.now();
  const q = query(
    collection(db, 'promos'),
    where('status', '==', 'aktif'),
    where('mulai', '<=', now),
    where('berakhir', '>=', now),
    orderBy('mulai', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Promo));
};

// ============================================
// FLASH SALE PRODUCTS
// ============================================
export const getFlashSaleProducts = async () => {
  const now = Timestamp.now();
  const q = query(
    collection(db, 'products'),
    where('status', '==', 'aktif'),
    where('flashSale.aktif', '==', true),
    where('flashSale.berakhir', '>=', now),
    limit(10)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

// ============================================
// ADMIN FUNCTIONS
// ============================================
export const approveOrder = async (orderId: string) => {
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);
  if (!orderSnap.exists()) throw new Error('Order tidak ditemukan');
  const orderData = orderSnap.data() as Order;
  
  const product = await getProductById(orderData.productId);

if (!product) {
  throw new Error('Produk tidak ditemukan');
}

  const licenseKey = generateLicenseKey();

  await updateDoc(orderRef, {
  statusPembayaran: 'berhasil',
  licenseKey,
  emailTerkirim: false,
  reviewedAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
});

  await addDoc(collection(db, 'licenses'), {
    licenseKey,
    orderId: orderId,
    userId: orderData.userId,
    productId: orderData.productId,
    productNama: orderData.productNama,
    status: 'aktif',
    lisensiTipe: orderData.lisensi,
    maxDevices: orderData.lisensi === 'personal' ? 1 : orderData.lisensi === 'commercial' ? 5 : 999,
    devices: [],
    createdAt: Timestamp.now(),
  });

  await sendLicenseEmail({
  to_email: orderData.userEmail,
  to_name: orderData.userName,
  order_id: orderData.orderId,
  product_name: product.nama,
  license_key: licenseKey,
  download_link: product.fileUrl,
});

await updateDoc(orderRef, {
  emailTerkirim: true,
  emailDikirimAt: Timestamp.now(),
});

  return { success: true, licenseKey };
};

export const rejectOrder = async (orderId: string, alasan: string) => {
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);
  if (!orderSnap.exists()) throw new Error('Order tidak ditemukan');
  const orderData = orderSnap.data() as Order;

  await updateDoc(orderRef, {
    statusPembayaran: 'ditolak',
    adminNotes: alasan,
    reviewedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  await sendRejectionEmail({
    to_email: orderData.userEmail,
    to_name: orderData.userName,
    order_id: orderData.orderId,
    alasan: alasan,
  });

  return { success: true };
};

