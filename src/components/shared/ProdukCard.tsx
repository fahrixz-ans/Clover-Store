import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Share2, Zap } from 'lucide-react';
import type { Product } from '@/types';
import { formatRupiah } from '@/utils/formatRupiah';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

interface ProdukCardProps {
  product: Product;
  showMission?: boolean;
}

export default function ProdukCard({ product, showMission = true }: ProdukCardProps) {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      productNama: product.nama,
      productThumbnail: product.thumbnail,
      lisensi: 'personal',
      harga: product.flashSale?.aktif ? product.flashSale.hargaDiskon : product.harga.personal,
      quantity: 1,
    });
    showToast(`${product.nama} ditambahkan ke keranjang`, 'success');
  };

  const displayHarga = product.flashSale?.aktif ? product.flashSale.hargaDiskon : product.harga.personal;
  const originalHarga = product.flashSale?.aktif ? product.harga.personal : null;

  return (
    <Link to={`/produk/${product.slug}`} className="group block">
      <div className="bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border border-gray-50">
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={product.thumbnail}
            alt={product.nama}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.flashSale?.aktif && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-accent text-white text-xs font-bold rounded">
                <Zap className="w-3 h-3" />
                -{product.flashSale.diskonPersen}%
              </span>
            )}
            {product.badge?.map((badge) => (
              <span key={badge} className="px-2 py-0.5 bg-primary text-white text-xs font-medium rounded capitalize">
                {badge.replace('-', ' ')}
              </span>
            ))}
          </div>

          {/* Mission Badge */}
          {showMission && product.misiReward && product.misiReward > 0 && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-secondary text-white text-xs font-bold rounded flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Misi +{formatRupiah(product.misiReward)}
            </div>
          )}

          {/* Quick Actions */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={handleAddToCart}
              className="p-2 bg-white rounded-full shadow-md hover:bg-primary hover:text-white transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
            <button className="p-2 bg-white rounded-full shadow-md hover:bg-accent hover:text-white transition-colors">
              <Heart className="w-4 h-4" />
            </button>
            <button className="p-2 bg-white rounded-full shadow-md hover:bg-secondary hover:text-white transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {product.nama}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium text-gray-700">{product.rating}</span>
            <span className="text-xs text-gray-400">| {product.totalTerjual.toLocaleString('id-ID')} terjual</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">{formatRupiah(displayHarga)}</span>
            {originalHarga && (
              <span className="text-xs text-gray-400 line-through">{formatRupiah(originalHarga)}</span>
            )}
          </div>

          {/* Instant Badge */}
          <div className="mt-2 flex items-center gap-1">
            <span className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded font-medium">
              ⚡ Instant
            </span>
            {product.misiReward && product.misiReward > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 bg-secondary/10 text-secondary rounded font-medium">
                🎯 Misi +{formatRupiah(product.misiReward)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
