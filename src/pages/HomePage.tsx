import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Zap, Target, ArrowRight, TrendingUp, BookOpen, Palette, FileText, Type, Shapes, Package } from 'lucide-react';
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { Product, Mission, Blog } from '@/types';
import ProdukCard from '@/components/shared/ProdukCard';
import MisiCard from '@/components/shared/MisiCard';
import BlogCard from '@/components/shared/BlogCard';
import FlashSaleCountdown from '@/components/shared/FlashSaleCountdown';
import EmptyState from '@/components/shared/EmptyState';
import { useAuth } from '@/context/AuthContext';

const categories = [
  { label: 'Template', icon: Palette, count: '250+', path: '/kategori/template' },
  { label: 'E-Book', icon: FileText, count: '120+', path: '/kategori/e-book' },
  { label: 'Icon', icon: Shapes, count: '500+', path: '/kategori/icon' },
  { label: 'Font', icon: Type, count: '80+', path: '/kategori/font' },
  { label: 'Bundle', icon: Package, count: '50+', path: '/kategori/bundle' },
];

export default function HomePage() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    const now = Timestamp.now();

    // Subscribe to products
    const productsUnsub = onSnapshot(
      query(collection(db, 'products'), where('status', '==', 'aktif'), orderBy('createdAt', 'desc'), limit(12)),
      (snapshot) => {
        const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(prods);
      }
    );

    // Subscribe to flash sale products
    const flashUnsub = onSnapshot(
      query(
        collection(db, 'products'),
        where('status', '==', 'aktif'),
        where('flashSale.aktif', '==', true),
        where('flashSale.berakhir', '>=', now),
        limit(6)
      ),
      (snapshot) => {
        const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setFlashSaleProducts(prods);
      }
    );

    // Subscribe to missions
    const missionsUnsub = onSnapshot(
      query(collection(db, 'missions'), where('status', '==', 'aktif'), orderBy('createdAt', 'desc'), limit(6)),
      (snapshot) => {
        const misi = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mission));
        setMissions(misi);
        setLoading(false);
      }
    );

    // Subscribe to blogs
    const blogsUnsub = onSnapshot(
      query(collection(db, 'blogs'), where('status', '==', 'published'), orderBy('publishedAt', 'desc'), limit(4)),
      (snapshot) => {
        const blogList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog));
        setBlogs(blogList);
      }
    );

    return () => {
      productsUnsub();
      flashUnsub();
      missionsUnsub();
      blogsUnsub();
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/cari?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-light to-primary-dark py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              🎨 Koleksi Template, Font, & Asset Digital
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-8">
              "Tingkatkan karya desainmu dalam 5 menit"
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-8">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari Produk..."
                  className="w-full pl-11 pr-4 py-3.5 bg-white rounded-pill text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <Link
                to="/misi-cuan"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-secondary text-white font-semibold rounded-pill hover:bg-secondary-dark transition-colors"
              >
                <Target className="w-5 h-5" />
                Mulai Misi Cuan
              </Link>
            </form>

            {!currentUser && (
              <p className="text-white/60 text-sm">
                <Link to="/masuk" className="text-secondary-light hover:underline font-medium">Masuk</Link> untuk mengakses semua fitur
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-card shadow-card p-4 sm:p-6">
          <div className="grid grid-cols-5 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                to={cat.path}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-primary/5 transition-colors group"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <cat.icon className="w-6 h-6 text-primary group-hover:text-white" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">{cat.label}</span>
                <span className="text-[10px] text-gray-400">{cat.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale */}
      {flashSaleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-10">
          <div className="bg-accent rounded-card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-white" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">FLASH SALE</h2>
                <span className="text-white/80 text-sm">Berakhir dalam:</span>
              </div>
              <FlashSaleCountdown targetDate={flashSaleProducts[0]?.flashSale?.berakhir || null} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {flashSaleProducts.map((product) => (
                <ProdukCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Misi Cuan */}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-accent" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">🎯 Misi Cuan Hari Ini</h2>
          </div>
          <Link to="/misi-cuan" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {missions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {missions.map((mission) => (
              <MisiCard key={mission.id} mission={mission} />
            ))}
          </div>
        ) : (
          <EmptyState type="missions" />
        )}
      </section>

      {/* Recommended Products */}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-secondary" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">💎 Rekomendasi Untukmu</h2>
          </div>
          <Link to="/produk" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {products.map((product) => (
              <ProdukCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState type="products" actionLabel="🛒 Jelajahi Produk" actionPath="/produk" />
        )}
      </section>

      {/* Blog */}
      {blogs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-12 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">📝 Blog & Tutorial</h2>
            </div>
            <Link to="/blog" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
