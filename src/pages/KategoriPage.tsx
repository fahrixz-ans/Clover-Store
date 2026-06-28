import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { ChevronLeft, Palette, FileText, Type, Shapes, Package } from 'lucide-react';
import type { Product } from '@/types';
import ProdukCard from '@/components/shared/ProdukCard';
import EmptyState from '@/components/shared/EmptyState';

const kategoriConfig: Record<string, { label: string; icon: typeof Palette; description: string; emoji: string }> = {
  template: { label: 'Template', icon: Palette, description: 'Template presentasi profesional untuk berbagai kebutuhan', emoji: '🎨' },
  'e-book': { label: 'E-Book', icon: FileText, description: 'E-book panduan dan tutorial lengkap', emoji: '📚' },
  font: { label: 'Font', icon: Type, description: 'Koleksi font premium untuk desain', emoji: '🔤' },
  icon: { label: 'Icon', icon: Shapes, description: 'Icon set untuk website dan aplikasi', emoji: '🎨' },
  bundle: { label: 'Bundle', icon: Package, description: 'Paket bundle hemat berbagai produk', emoji: '🎁' },
};

export default function KategoriPage() {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const config = kategoriConfig[slug || ''] || { label: slug || 'Kategori', icon: Package, description: '', emoji: '📦' };
  const IconComponent = config.icon;

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const q = query(
      collection(db, 'products'),
      where('kategori', '==', slug),
      where('status', '==', 'aktif'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
      setLoading(false);
    });

    return unsub;
  }, [slug]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mb-4">
            <ChevronLeft className="w-4 h-4" /> Beranda
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
              <IconComponent className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{config.emoji} {config.label}</h1>
              <p className="text-sm text-gray-500">{config.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {products.map((product) => (
              <ProdukCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState 
            type="products" 
            title={`Belum ada produk ${config.label}`}
            description={`Produk ${config.label} akan segera tersedia.`}
            actionLabel="🛒 Jelajahi Produk Lain"
            actionPath="/"
          />
        )}
      </div>
    </div>
  );
}
