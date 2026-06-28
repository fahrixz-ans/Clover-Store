import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Star, ShoppingCart, Heart, Download, Shield, Zap, Award, MessageSquare } from 'lucide-react';
import type { Product, Review, QnA } from '@/types';
import { formatRupiah } from '@/utils/formatRupiah';
import { formatDate } from '@/utils/dateHelpers';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import FlashSaleCountdown from '@/components/shared/FlashSaleCountdown';
import ProdukCard from '@/components/shared/ProdukCard';
import EmptyState from '@/components/shared/EmptyState';

const licenseOptions = [
  { key: 'personal' as const, label: 'Personal', devices: '1 device' },
  { key: 'commercial' as const, label: 'Commercial', devices: '5 devices' },
  { key: 'extended' as const, label: 'Extended', devices: 'Unlimited' },
];

export default function ProdukDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [qnas, setQnas] = useState<QnA[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedLicense, setSelectedLicense] = useState<'personal' | 'commercial' | 'extended'>('personal');
  const [activeTab, setActiveTab] = useState<'deskripsi' | 'ulasan' | 'qa'>('deskripsi');
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const q = query(collection(db, 'products'), where('slug', '==', slug));
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const prod = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Product;
        setProduct(prod);
        
        // Fetch related products
        const relatedUnsub = onSnapshot(
          query(collection(db, 'products'), where('kategori', '==', prod.kategori), where('status', '==', 'aktif')),
          (relSnapshot) => {
            const related = relSnapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() } as Product))
              .filter(p => p.id !== prod.id)
              .slice(0, 4);
            setRelatedProducts(related);
          }
        );

        // Fetch reviews
        const reviewsUnsub = onSnapshot(
          query(collection(db, 'reviews'), where('productId', '==', prod.id)),
          (revSnapshot) => {
            const revs = revSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
            setReviews(revs);
          }
        );

        // Fetch Q&A
        const qnaUnsub = onSnapshot(
          query(collection(db, 'qna'), where('productId', '==', prod.id)),
          (qnaSnapshot) => {
            const qnaList = qnaSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QnA));
            setQnas(qnaList);
          }
        );

        setLoading(false);
        return () => { relatedUnsub(); reviewsUnsub(); qnaUnsub(); };
      }
      setLoading(false);
    });

    return () => unsub();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    const harga = product.flashSale?.aktif ? product.flashSale.hargaDiskon : product.harga[selectedLicense];
    addToCart({
      productId: product.id,
      productNama: product.nama,
      productThumbnail: product.thumbnail,
      lisensi: selectedLicense,
      harga,
      quantity: 1,
    });
    showToast(`${product.nama} ditambahkan ke keranjang`, 'success');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background py-12">
        <EmptyState type="products" title="Produk tidak ditemukan" description="Produk yang kamu cari tidak tersedia." actionLabel="Kembali ke Beranda" actionPath="/" />
      </div>
    );
  }

  const displayHarga = product.flashSale?.aktif ? product.flashSale.hargaDiskon : product.harga[selectedLicense];
  const originalHarga = product.harga[selectedLicense];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm">
          <Link to="/" className="text-gray-500 hover:text-primary">Beranda</Link>
          <span className="text-gray-300">/</span>
          <Link to={`/kategori/${product.kategori}`} className="text-gray-500 hover:text-primary capitalize">{product.kategori}</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium truncate">{product.nama}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <div>
            <div className="relative aspect-[4/3] bg-gray-100 rounded-card overflow-hidden mb-3">
              <img
                src={product.gallery[currentImage] || product.thumbnail}
                alt={product.nama}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = product.thumbnail; }}
              />
              {product.badge?.includes('best-seller') && (
                <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-500 text-white text-sm font-bold rounded flex items-center gap-1">
                  <Award className="w-4 h-4" /> Best Seller
                </div>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {[product.thumbnail, ...product.gallery].filter(Boolean).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                    currentImage === i ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{product.nama}</h1>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
                <span className="text-sm font-medium ml-1">{product.rating}</span>
              </div>
              <span className="text-sm text-gray-500">({product.totalUlasan.toLocaleString('id-ID')} ulasan)</span>
              <span className="text-sm text-gray-500">🛒 {product.totalTerjual.toLocaleString('id-ID')}+ terjual</span>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-medium rounded flex items-center gap-1">
                <Zap className="w-3 h-3" /> Instant Download
              </span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded flex items-center gap-1">
                <Shield className="w-3 h-3" /> Licensed
              </span>
              {product.flashSale?.aktif && (
                <span className="px-2.5 py-1 bg-accent/10 text-accent text-xs font-bold rounded">
                  ⚡ -{product.flashSale.diskonPersen}% Flash Sale
                </span>
              )}
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-card p-4 mb-4">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-bold text-primary">{formatRupiah(displayHarga)}</span>
                {product.flashSale?.aktif && (
                  <span className="text-lg text-gray-400 line-through">{formatRupiah(originalHarga)}</span>
                )}
              </div>
              {product.flashSale?.aktif && (
                <FlashSaleCountdown targetDate={product.flashSale.berakhir} className="mt-2" />
              )}
            </div>

            {/* License Selector */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Pilih Lisensi:</h3>
              <div className="grid grid-cols-3 gap-2">
                {licenseOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedLicense(opt.key)}
                    className={`p-3 rounded-card border-2 text-center transition-all ${
                      selectedLicense === opt.key
                        ? 'border-secondary bg-secondary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-sm">{opt.label}</div>
                    <div className="text-primary font-bold text-lg">{formatRupiah(product.flashSale?.aktif ? product.flashSale.hargaDiskon : product.harga[opt.key])}</div>
                    <div className="text-xs text-gray-500">{opt.devices}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* File Info */}
            <div className="bg-white rounded-card border border-gray-100 p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">📦 Info File:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Format: {product.fileFormat.join(', ')}</li>
                <li>• Size: {product.fileSize} (ZIP)</li>
                <li>• Update gratis forever</li>
              </ul>
              <button className="mt-3 text-sm text-primary hover:underline font-medium flex items-center gap-1">
                <Download className="w-4 h-4" /> Preview 5 Halaman
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleBuyNow}
                className="flex-1 py-3.5 bg-primary text-white font-semibold rounded-button hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Beli {formatRupiah(displayHarga)}
              </button>
              <button
                onClick={handleAddToCart}
                className="px-4 py-3.5 border-2 border-primary text-primary font-semibold rounded-button hover:bg-primary/5 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
              <button className="px-4 py-3.5 border-2 border-gray-200 rounded-button hover:border-accent hover:text-accent transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Misi Reward */}
            {product.misiReward && product.misiReward > 0 && (
              <div className="mt-4 p-3 bg-secondary/10 rounded-card border border-secondary/20">
                <p className="text-sm font-medium text-secondary-dark">
                  🎯 ATAU GRATIS! Kerjakan misi dan dapatkan produk ini senilai {formatRupiah(product.misiReward)}
                </p>
                <Link to="/misi-cuan" className="text-sm text-primary hover:underline font-medium mt-1 inline-block">
                  Lihat Misi →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10 bg-white rounded-card border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
            {[
              { key: 'deskripsi' as const, label: 'Deskripsi' },
              { key: 'ulasan' as const, label: `Ulasan (${reviews.length})` },
              { key: 'qa' as const, label: `Q&A (${qnas.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'deskripsi' && (
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: product.deskripsi }} />
              </div>
            )}

            {activeTab === 'ulasan' && (
              <div>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                            {review.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{review.userName}</div>
                            <div className="flex items-center gap-1">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                          <span className="ml-auto text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{review.komentar}</p>
                        {review.screenshot && (
                          <img src={review.screenshot} alt="Review" className="mt-2 rounded-lg max-w-xs" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState type="generic" title="Belum ada ulasan" description="Jadilah yang pertama memberikan ulasan untuk produk ini." />
                )}
              </div>
            )}

            {activeTab === 'qa' && (
              <div>
                {qnas.length > 0 ? (
                  <div className="space-y-4">
                    {qnas.map((qna) => (
                      <div key={qna.id} className="border-b border-gray-100 pb-4 last:border-0">
                        <div className="flex items-start gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{qna.pertanyaan}</p>
                            <span className="text-xs text-gray-400">{qna.userName} • {formatDate(qna.createdAt)}</span>
                          </div>
                        </div>
                        {qna.jawaban && (
                          <div className="ml-6 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{qna.jawaban}</p>
                            <span className="text-xs text-gray-400">{qna.dijawabOleh || 'Seller'}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState type="generic" title="Belum ada pertanyaan" description="Jadilah yang pertama bertanya tentang produk ini." />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Produk Serupa</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((prod) => (
                <ProdukCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
