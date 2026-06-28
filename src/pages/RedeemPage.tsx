import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { ChevronLeft, Ticket, ChevronDown, ChevronUp, Download, Key, FileText, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import type { License } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/utils/dateHelpers';

export default function RedeemPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [licenseKey, setLicenseKey] = useState('');
  const [licenses, setLicenses] = useState<License[]>([]);
  const [redeemResult, setRedeemResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showHowTo, setShowHowTo] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    
    const q = query(
      collection(db, 'licenses'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      const lic = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as License));
      setLicenses(lic);
    });

    return unsub;
  }, [currentUser]);

  const handleRedeem = async () => {
    if (!licenseKey.trim()) {
      setRedeemResult({ success: false, message: 'Masukkan license key' });
      return;
    }

    // Check if key exists in user's licenses
    const found = licenses.find(l => l.licenseKey === licenseKey.replace(/\s/g, ''));
    if (found) {
      if (found.status === 'aktif') {
        setRedeemResult({ success: true, message: 'License key sudah aktif!' });
      } else {
        setRedeemResult({ success: true, message: 'License key berhasil diaktifkan!' });
      }
    } else {
      setRedeemResult({ success: false, message: 'License key tidak ditemukan atau tidak valid' });
    }
  };

  const formatKey = (value: string) => {
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const parts = [];
    for (let i = 0; i < cleaned.length && i < 16; i += 4) {
      parts.push(cleaned.slice(i, i + 4));
    }
    return parts.join('-');
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLicenseKey(formatKey(e.target.value));
  };

  const getStatusColor = (status: string, expiresAt?: Date | null) => {
    if (status === 'aktif') {
      if (expiresAt) {
        const daysLeft = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 15) return 'bg-orange-50 border-orange-200';
      }
      return 'bg-green-50 border-green-200';
    }
    if (status === 'expired') return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Redeem License</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Redeem Form */}
        <div className="bg-white rounded-card shadow-card p-6 mb-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Ticket className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Redeem License Key</h2>
            <p className="text-sm text-gray-500">Masukkan license key untuk mengaktifkan produk digital kamu</p>
          </div>

          <input
            type="text"
            value={licenseKey}
            onChange={handleKeyChange}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            maxLength={19}
            className="w-full px-4 py-4 text-center text-lg font-mono tracking-widest border-2 border-gray-200 rounded-button focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 mb-4"
          />

          <button
            onClick={handleRedeem}
            className="w-full py-4 bg-primary text-white font-semibold rounded-button hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
          >
            <Key className="w-5 h-5" /> Redeem Sekarang
          </button>

          {redeemResult && (
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              redeemResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {redeemResult.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <p className="text-sm">{redeemResult.message}</p>
            </div>
          )}

          <button className="block text-center text-sm text-primary hover:underline mt-4 mx-auto">
            📧 Belum terima email? Kirim Ulang
          </button>
        </div>

        {/* How To */}
        <div className="bg-white rounded-card shadow-card p-4 mb-6">
          <button
            onClick={() => setShowHowTo(!showHowTo)}
            className="flex items-center justify-between w-full"
          >
            <span className="font-medium text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" /> Cara Mendapatkan License Key
            </span>
            {showHowTo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {showHowTo && (
            <ol className="mt-3 space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-primary font-bold">1.</span> Beli produk di store</li>
              <li className="flex items-start gap-2"><span className="text-primary font-bold">2.</span> License dikirim ke email & muncul di akun</li>
              <li className="flex items-start gap-2"><span className="text-primary font-bold">3.</span> Salin & redeem di halaman ini</li>
            </ol>
          )}
        </div>

        {/* License History */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Riwayat Redeem</h2>
        
        {licenses.length > 0 ? (
          <div className="space-y-3">
            {licenses.map((lic) => (
              <div
                key={lic.id}
                className={`rounded-card border p-4 ${getStatusColor(lic.status, lic.expiresAt)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        lic.status === 'aktif' ? 'bg-green-500' : lic.status === 'expired' ? 'bg-red-500' : 'bg-gray-400'
                      }`} />
                      <h3 className="font-medium text-gray-900">{lic.productNama}</h3>
                    </div>
                    <code className="text-sm font-mono text-primary mt-1 block">{lic.licenseKey}</code>
                  </div>
                  <span className="text-xs font-medium capitalize px-2 py-1 rounded-full bg-white/80">
                    {lic.lisensiTipe}
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mb-3">
                  {lic.activatedAt ? `Diredeem ${formatDate(lic.activatedAt)}` : 'Belum diredeem'} • 
                  {lic.expiresAt ? ` Expire ${formatDate(lic.expiresAt)}` : ' Aktif Selamanya'}
                </p>

                <div className="flex gap-2">
                  <button className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-button text-gray-600 hover:bg-gray-50 flex items-center gap-1">
                    <Download className="w-3 h-3" /> Download
                  </button>
                  <button className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-button text-gray-600 hover:bg-gray-50 flex items-center gap-1">
                    <Key className="w-3 h-3" /> Detail
                  </button>
                  <button className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-button text-gray-600 hover:bg-gray-50 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Invoice
                  </button>
                  {lic.expiresAt && (
                    <button className="text-xs px-3 py-1.5 bg-warning/10 border border-warning/20 rounded-button text-warning hover:bg-warning/20 flex items-center gap-1 ml-auto">
                      <Clock className="w-3 h-3" /> Perpanjang
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-card">
            <Ticket className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Belum ada lisensi</h3>
            <p className="text-sm text-gray-400">License key akan muncul di sini setelah redeem</p>
          </div>
        )}
      </div>
    </div>
  );
}
