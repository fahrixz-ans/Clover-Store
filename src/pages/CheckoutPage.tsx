import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, Timestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { ChevronLeft, CreditCard, QrCode, Wallet, Building2, Tag, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatRupiah } from '@/utils/formatRupiah';

const paymentMethods = [
  { id: 'qris' as const, label: 'QRIS', icon: QrCode, description: 'Scan QRIS dari semua e-wallet dan bank' },
  { id: 'dana' as const, label: 'DANA', icon: Wallet, description: 'Pembayaran via DANA' },
  { id: 'gopay' as const, label: 'GoPay', icon: Wallet, description: 'Pembayaran via GoPay' },
  { id: 'ovo' as const, label: 'OVO', icon: Wallet, description: 'Pembayaran via OVO' },
  { id: 'transfer' as const, label: 'Transfer Bank', icon: Building2, description: 'Transfer manual ke rekening bank' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { showToast } = useToast();
  
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [useSaldo, setUseSaldo] = useState(false);
  const [saldoUsed, setSaldoUsed] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);

  const maxSaldoUse = Math.min(userProfile?.saldo || 0, totalPrice * 0.5);
  const finalPrice = totalPrice - saldoUsed;

  const handleSaldoToggle = () => {
    if (!useSaldo) {
      setSaldoUsed(maxSaldoUse);
    } else {
      setSaldoUsed(0);
    }
    setUseSaldo(!useSaldo);
  };

  const handleSaldoChange = (val: number) => {
    setSaldoUsed(Math.min(val, maxSaldoUse));
  };

  const generateOrderId = () => {
    const now = new Date();
    const yy = now.getFullYear().toString().slice(2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
    return `ORD-${yy}${mm}${dd}-${random}`;
  };

  const handleSubmitOrder = async () => {
    if (!selectedPayment) {
      showToast('Pilih metode pembayaran terlebih dahulu', 'warning');
      return;
    }
    if (!email) {
      showToast('Masukkan email untuk menerima link download', 'warning');
      return;
    }

    setShowConfirm(true);
  };

  const confirmPayment = async () => {
    setProcessing(true);
    try {
      const orderPromises = items.map(async (item) => {
        const orderId = generateOrderId();
        const orderData = {
          orderId,
          userId: currentUser?.uid || 'guest',
          userEmail: email,
          userName: currentUser?.displayName || email.split('@')[0],
          productId: item.productId,
          productNama: item.productNama,
          productThumbnail: item.productThumbnail,
          lisensi: item.lisensi,
          harga: item.harga,
          metodePembayaran: selectedPayment,
          statusPembayaran: 'pending' as const,
          saldoDigunakan: saldoUsed / items.length,
          totalBayar: finalPrice / items.length,
          emailTerkirim: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        await addDoc(collection(db, 'orders'), orderData);

        // Update product totalTerjual
        await updateDoc(doc(db, 'products', item.productId), {
          totalTerjual: increment(item.quantity),
        });

        return orderId;
      });

      const orderIds = await Promise.all(orderPromises);

      // Deduct saldo if used
      if (saldoUsed > 0 && currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          saldo: increment(-saldoUsed),
        });
      }

      clearCart();
      showToast('Pesanan berhasil dibuat! Menunggu konfirmasi admin.', 'success');
      navigate(`/thank-you/${orderIds[0]}`, { state: { orderIds } });
    } catch (error) {
      console.error('Error creating order:', error);
      showToast('Gagal membuat pesanan. Silakan coba lagi.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Keranjang Kosong</h2>
          <p className="text-gray-500 mb-6">Keranjang belanjamu masih kosong. Yuk mulai berbelanja!</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-white rounded-button hover:bg-primary-dark transition-colors"
          >
            Jelajahi Produk
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Checkout</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-sm">
          <span className="px-3 py-1 bg-primary text-white rounded-full font-medium">1</span>
          <span className="font-medium text-gray-900">Ringkasan</span>
          <span className="flex-1 h-px bg-gray-200" />
          <span className="px-3 py-1 bg-gray-200 text-gray-500 rounded-full">2</span>
          <span className="text-gray-500">Bayar</span>
          <span className="flex-1 h-px bg-gray-200" />
          <span className="px-3 py-1 bg-gray-200 text-gray-500 rounded-full">3</span>
          <span className="text-gray-500">Selesai</span>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-card shadow-card p-4">
          <h2 className="font-semibold text-gray-900 mb-4">📦 Ringkasan Pesanan</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={`${item.productId}-${item.lisensi}`} className="flex gap-3">
                <img src={item.productThumbnail} alt={item.productNama} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-gray-900">{item.productNama}</h3>
                  <p className="text-xs text-gray-500 capitalize">{item.lisensi} License</p>
                  <p className="text-sm font-bold text-primary">{formatRupiah(item.harga)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Saldo */}
        {currentUser && userProfile && userProfile.saldo > 0 && (
          <div className="bg-white rounded-card shadow-card p-4">
            <h2 className="font-semibold text-gray-900 mb-3">💰 Gunakan Saldo Cuan</h2>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">🪙 Rp{userProfile.saldo.toLocaleString('id-ID')} tersedia</span>
              <button
                onClick={handleSaldoToggle}
                className={`w-12 h-6 rounded-full transition-colors relative ${useSaldo ? 'bg-secondary' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${useSaldo ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {useSaldo && (
              <div>
                <input
                  type="range"
                  min={0}
                  max={maxSaldoUse}
                  value={saldoUsed}
                  onChange={(e) => handleSaldoChange(Number(e.target.value))}
                  className="w-full accent-secondary"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Rp0</span>
                  <span className="font-medium text-secondary">Gunakan {formatRupiah(saldoUsed)}</span>
                  <span>{formatRupiah(maxSaldoUse)}</span>
                </div>
                <p className="text-xs text-green-600 mt-2 font-medium">Hemat: -{formatRupiah(saldoUsed)}</p>
              </div>
            )}
          </div>
        )}

        {/* Payment Methods */}
        <div className="bg-white rounded-card shadow-card p-4">
          <h2 className="font-semibold text-gray-900 mb-4">2. Metode Pembayaran</h2>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-card border-2 transition-all text-left ${
                  selectedPayment === method.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedPayment === method.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <method.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{method.label}</div>
                  <div className="text-xs text-gray-500">{method.description}</div>
                </div>
                <div className="text-sm font-bold text-primary">{formatRupiah(finalPrice)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-card shadow-card p-4">
          <h2 className="font-semibold text-gray-900 mb-3">3. Info Kontak</h2>
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> Email untuk link download & license key
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-button focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Promo Code */}
        <div className="bg-white rounded-card shadow-card p-4">
          <h2 className="font-semibold text-gray-900 mb-3">4. Kode Promo (Opsional)</h2>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Masukkan kode promo"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-button focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button className="px-4 py-3 bg-gray-100 text-gray-600 rounded-button hover:bg-gray-200 transition-colors text-sm font-medium">
              Gunakan
            </button>
          </div>
        </div>

        {/* Agreement */}
        <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          Dengan klik Beli, kamu menyetujui <button className="text-primary hover:underline">Syarat & Ketentuan</button>
        </p>
      </div>

      {/* Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50 lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:mt-6 lg:max-w-3xl lg:mx-auto lg:px-4 lg:mb-10">
        <div className="flex items-center justify-between gap-4 max-w-3xl mx-auto">
          <div>
            <p className="text-xs text-gray-500">Total Bayar:</p>
            <p className="text-xl font-bold text-primary">{formatRupiah(finalPrice)}</p>
          </div>
          <button
            onClick={handleSubmitOrder}
            disabled={!selectedPayment || !email || processing}
            className="flex-1 max-w-xs py-3.5 bg-primary text-white font-semibold rounded-button hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            {processing ? 'Memproses...' : 'Bayar Sekarang'}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Konfirmasi Pembayaran</h3>
            <p className="text-sm text-gray-500 mb-4">Pastikan detail pembelian sudah benar:</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Transaksi:</span>
                <span className="font-medium">{formatRupiah(totalPrice)}</span>
              </div>
              {saldoUsed > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Diskon Saldo:</span>
                  <span className="font-medium text-green-600">-{formatRupiah(saldoUsed)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2">
                <span>Total Bayar:</span>
                <span className="text-primary">{formatRupiah(finalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Metode:</span>
                <span className="font-medium capitalize">{selectedPayment}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 border border-gray-200 rounded-button text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmPayment}
                disabled={processing}
                className="flex-1 py-3 bg-primary text-white rounded-button hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {processing ? 'Memproses...' : 'Bayar Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
