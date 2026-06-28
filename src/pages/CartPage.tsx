import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatRupiah } from '@/utils/formatRupiah';
import EmptyState from '@/components/shared/EmptyState';

const licenseLabels: Record<string, string> = {
  personal: 'Personal',
  commercial: 'Commercial',
  extended: 'Extended',
};

export default function CartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold">Keranjang ({totalItems})</h1>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <EmptyState 
            type="cart" 
            title="Keranjang Kosong"
            description="Keranjang belanjamu masih kosong. Yuk mulai berbelanja!"
            actionLabel="🛒 Jelajahi Produk"
            actionPath="/"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Keranjang ({totalItems})</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">
        {items.map((item) => (
          <div key={`${item.productId}-${item.lisensi}`} className="bg-white rounded-card shadow-card p-4">
            <div className="flex gap-3">
              <img
                src={item.productThumbnail}
                alt={item.productNama}
                className="w-20 h-20 rounded-lg object-cover bg-gray-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{item.productNama}</h3>
                <p className="text-xs text-gray-500 capitalize mt-0.5">{licenseLabels[item.lisensi]} License</p>
                <p className="text-sm font-bold text-primary mt-1">{formatRupiah(item.harga)}</p>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.lisensi, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.lisensi, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId, item.lisensi)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Total ({totalItems} item):</span>
            <span className="text-xl font-bold text-primary">{formatRupiah(totalPrice)}</span>
          </div>
          <Link
            to="/checkout"
            className="block w-full py-3.5 bg-primary text-white font-semibold rounded-button hover:bg-primary-dark transition-colors text-center"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
