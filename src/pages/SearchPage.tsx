import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { Product } from '@/types';
import ProdukCard from '@/components/shared/ProdukCard';
import EmptyState from '@/components/shared/EmptyState';

const kategoriOptions = ['semua', 'template', 'e-book', 'font', 'icon', 'bundle'];
const sortOptions = [
  { key: 'terbaru', label: 'Terbaru' },
  { key: 'termurah', label: 'Termurah' },
  { key: 'termahal', label: 'Termahal' },
  { key: 'terpopuler', label: 'Terpopuler' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const kategoriParam = searchParams.get('kategori') || 'semua';
  
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeKategori, setActiveKategori] = useState(kategoriParam);
  const [activeSort, setActiveSort] = useState('terbaru');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [priceRange] = useState<[number, number]>([0, 10000000]);

  useEffect(() => {
    setLoading(true);
    
    let q = query(collection(db, 'products'), where('status', '==', 'aktif'), orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
      setLoading(false);
    });

    return unsub;
  }, []);

  useEffect(() => {
    let result = [...products];

    // Search filter
    if (queryParam) {
      const q = queryParam.toLowerCase();
      result = result.filter(p => 
        p.nama.toLowerCase().includes(q) ||
        p.deskripsiSingkat.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.kategori.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (activeKategori !== 'semua') {
      result = result.filter(p => p.kategori === activeKategori);
    }

    // Price filter
    result = result.filter(p => {
      const harga = p.flashSale?.aktif ? p.flashSale.hargaDiskon : p.harga.personal;
      return harga >= priceRange[0] && harga <= priceRange[1];
    });

    // Sort
    switch (activeSort) {
      case 'termurah':
        result.sort((a, b) => {
          const ha = a.flashSale?.aktif ? a.flashSale.hargaDiskon : a.harga.personal;
          const hb = b.flashSale?.aktif ? b.flashSale.hargaDiskon : b.harga.personal;
          return ha - hb;
        });
        break;
      case 'termahal':
        result.sort((a, b) => {
          const ha = a.flashSale?.aktif ? a.flashSale.hargaDiskon : a.harga.personal;
          const hb = b.flashSale?.aktif ? b.flashSale.hargaDiskon : b.harga.personal;
          return hb - ha;
        });
        break;
      case 'terpopuler':
        result.sort((a, b) => b.totalTerjual - a.totalTerjual);
        break;
    }

    setFilteredProducts(result);
  }, [products, queryParam, activeKategori, activeSort, priceRange]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery, kategori: activeKategori });
  };

  const handleKategoriChange = (kat: string) => {
    setActiveKategori(kat);
    setSearchParams({ q: searchQuery, kategori: kat });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk..."
              className="w-full pl-10 pr-10 py-3 bg-gray-100 rounded-pill text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSearchParams({}); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Filters */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
          {kategoriOptions.map((kat) => (
            <button
              key={kat}
              onClick={() => handleKategoriChange(kat)}
              className={`px-4 py-2 rounded-pill text-sm font-medium whitespace-nowrap capitalize transition-colors ${
                activeKategori === kat ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {kat}
            </button>
          ))}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-4 py-2 rounded-pill text-sm font-medium text-gray-600 bg-white border border-gray-200 ml-auto"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Sort */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{filteredProducts.length} hasil</p>
          <div className="flex gap-1">
            {sortOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setActiveSort(opt.key)}
                className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-colors ${
                  activeSort === opt.key ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredProducts.map((product) => (
              <ProdukCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState 
            type="products" 
            title={queryParam ? `Tidak ada hasil untuk "${queryParam}"` : 'Tidak ada produk'}
            description="Coba kata kunci lain atau ubah filter."
          />
        )}
      </div>
    </div>
  );
}
