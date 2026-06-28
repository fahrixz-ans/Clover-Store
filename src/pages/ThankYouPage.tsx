import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { CheckCircle, Download, Copy, FileText, Mail, Key, Clock } from 'lucide-react';
import type { Order } from '@/types';
import { formatRupiah } from '@/utils/formatRupiah';

export default function ThankYouPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const [,] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const unsub = onSnapshot(doc(db, 'orders', id), (docSnap) => {
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
      }
      setLoading(false);
    });

    return unsub;
  }, [id]);

  const handleCopyKey = () => {
    if (order?.licenseKey) {
      navigator.clipboard.writeText(order.licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pesanan tidak ditemukan</h2>
          <Link to="/" className="text-primary hover:underline">Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {order.statusPembayaran === 'berhasil' ? 'Pembayaran Berhasil!' : 'Pesanan Diterima!'}
          </h1>
          <p className="text-gray-500 mb-2">
            {order.statusPembayaran === 'berhasil'
              ? `Terima kasih telah membeli "${order.productNama}"`
              : `Pesanan "${order.productNama}" sedang menunggu konfirmasi admin`}
          </p>
          <div className="flex items-center justify-center gap-1 text-sm text-primary">
            <Mail className="w-4 h-4" />
            Email konfirmasi akan dikirim ke {order.userEmail}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-card shadow-card p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Detail Pesanan</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order ID:</span>
              <span className="font-mono font-medium">{order.orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Produk:</span>
              <span className="font-medium">{order.productNama}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Lisensi:</span>
              <span className="font-medium capitalize">{order.lisensi}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total:</span>
              <span className="font-bold text-primary">{formatRupiah(order.totalBayar)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status:</span>
              <span className={`font-medium capitalize ${
                order.statusPembayaran === 'berhasil' ? 'text-green-600' :
                order.statusPembayaran === 'pending' ? 'text-yellow-600' :
                order.statusPembayaran === 'ditolak' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {order.statusPembayaran === 'pending' && <Clock className="w-3.5 h-3.5 inline mr-1" />}
                {order.statusPembayaran}
              </span>
            </div>
          </div>
        </div>

        {/* License Key */}
        {order.licenseKey && (
          <div className="bg-white rounded-card shadow-card p-6 mb-6 border-2 border-secondary/30">
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-5 h-5 text-secondary" />
              <h2 className="font-semibold text-gray-900">License Key</h2>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <code className="flex-1 font-mono text-lg text-primary tracking-wider">{order.licenseKey}</code>
              <button
                onClick={handleCopyKey}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-500" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">💡 Simpan license key untuk update gratis</p>
          </div>
        )}

        {/* Download */}
        {order.statusPembayaran === 'berhasil' && (
          <div className="bg-white rounded-card shadow-card p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Download Produk</h2>
            <a
              href={order.fileDownloadUrl || '#'}
              className="flex items-center justify-center gap-2 w-full py-4 bg-secondary text-white font-semibold rounded-button hover:bg-secondary-dark transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Sekarang
            </a>
            <p className="text-xs text-gray-500 text-center mt-2">Link aktif 30 hari, 5x download</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mb-8">
          <button className="flex-1 py-3 border border-gray-200 rounded-button text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" /> Download Invoice
          </button>
          <button className="flex-1 py-3 border border-gray-200 rounded-button text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" /> Kirim ke Email Lain
          </button>
        </div>

        {/* Back */}
        <div className="text-center">
          <Link to="/" className="text-primary hover:underline font-medium">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
