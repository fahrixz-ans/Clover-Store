// ============================================
// COLLECTION: users
// ============================================
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  saldo: number;
  saldoPending: number;
  totalMisiSelesai: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// COLLECTION: products
// ============================================
export interface Product {
  id: string;
  nama: string;
  slug: string;
  deskripsi: string;
  deskripsiSingkat: string;
  kategori: 'template' | 'e-book' | 'font' | 'icon' | 'bundle';
  tags: string[];
  harga: {
    personal: number;
    commercial: number;
    extended: number;
  };
  thumbnail: string;
  gallery: string[];
  previewVideo?: string;
  fileUrl: string;
  fileSize: string;
  fileFormat: string[];
  rating: number;
  totalUlasan: number;
  totalTerjual: number;
  badge?: string[];
  flashSale?: {
    aktif: boolean;
    hargaDiskon: number;
    diskonPersen: number;
    mulai: Date;
    berakhir: Date;
  };
  misiReward?: number;
  status: 'aktif' | 'nonaktif' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// COLLECTION: orders
// ============================================
export interface Order {
  id: string;
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string;
  productId: string;
  productNama: string;
  productThumbnail: string;
  lisensi: 'personal' | 'commercial' | 'extended';
  harga: number;
  metodePembayaran: 'qris' | 'dana' | 'gopay' | 'ovo' | 'transfer';
  statusPembayaran: 'pending' | 'diproses' | 'ditolak' | 'berhasil';
  saldoDigunakan: number;
  totalBayar: number;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  licenseKey?: string;
  fileDownloadUrl?: string;
  invoiceUrl?: string;
  emailTerkirim: boolean;
  emailDikirimAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// COLLECTION: missions
// ============================================
export interface Mission {
  id: string;
  judul: string;
  deskripsi: string;
  kategori: 'review' | 'share' | 'download' | 'referral' | 'survey' | 'coba';
  reward: number;
  estimasiWaktu: number;
  maxAmbil: number;
  maxPerHari?: number;
  persyaratan: string[];
  langkahKerja: string[];
  status: 'aktif' | 'nonaktif';
  totalPartisipan: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// COLLECTION: userMissions
// ============================================
export interface UserMission {
  id: string;
  userId: string;
  missionId: string;
  missionJudul: string;
  status: 'diambil' | 'dikerjakan' | 'disubmit' | 'direview' | 'berhasil' | 'ditolak';
  buktiScreenshot?: string;
  buktiLink?: string;
  adminNotes?: string;
  reviewedAt?: Date;
  rewardDiterima: number;
  rewardStatus: 'pending' | 'diterima' | 'ditolak';
  diambilAt: Date;
  deadlineAt: Date;
  disubmitAt?: Date;
  selesaiAt?: Date;
}

// ============================================
// COLLECTION: transactions
// ============================================
export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  tipe: 'pemasukan' | 'pengeluaran' | 'penarikan';
  kategori: 'reward_misi' | 'beli_produk' | 'topup' | 'penarikan' | 'referral';
  jumlah: number;
  deskripsi: string;
  orderId?: string;
  missionId?: string;
  penarikanId?: string;
  status: 'pending' | 'berhasil' | 'ditolak';
  metode?: string;
  tujuan?: string;
  createdAt: Date;
}

// ============================================
// COLLECTION: blogs
// ============================================
export interface Blog {
  id: string;
  judul: string;
  slug: string;
  konten: string;
  excerpt: string;
  thumbnail: string;
  gallery?: string[];
  videoUrl?: string;
  kategori: string[];
  tags: string[];
  views: number;
  likes: number;
  totalKomentar: number;
  produkTerkait?: string[];
  status: 'published' | 'draft' | 'archived';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// COLLECTION: licenses
// ============================================
export interface License {
  id: string;
  licenseKey: string;
  orderId: string;
  userId: string;
  productId: string;
  productNama: string;
  status: 'aktif' | 'expired' | 'dicabut';
  lisensiTipe: 'personal' | 'commercial' | 'extended';
  devices: string[];
  maxDevices: number;
  activatedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

// ============================================
// COLLECTION: promos
// ============================================
export interface Promo {
  id: string;
  nama: string;
  tipe: 'flash-sale' | 'diskon' | 'bundle';
  productIds: string[];
  atauSemuaProduk: boolean;
  diskonPersen?: number;
  diskonNominal?: number;
  hargaSpesial?: number;
  mulai: Date;
  berakhir: Date;
  status: 'aktif' | 'nonaktif' | 'selesai';
  createdAt: Date;
}

// ============================================
// COLLECTION: carts (client-side only)
// ============================================
export interface CartItem {
  productId: string;
  productNama: string;
  productThumbnail: string;
  lisensi: 'personal' | 'commercial' | 'extended';
  harga: number;
  quantity: number;
}

// ============================================
// Blog Comment
// ============================================
export interface BlogComment {
  id: string;
  blogId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  konten: string;
  likes: number;
  createdAt: Date;
}

// ============================================
// Review
// ============================================
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  komentar: string;
  screenshot?: string;
  verified: boolean;
  likes: number;
  createdAt: Date;
}

// ============================================
// QnA
// ============================================
export interface QnA {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  pertanyaan: string;
  jawaban?: string;
  dijawabOleh?: string;
  createdAt: Date;
  dijawabAt?: Date;
}
