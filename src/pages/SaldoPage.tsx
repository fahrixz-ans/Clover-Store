import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { ChevronDown, ChevronUp, Wallet, ArrowDownCircle, Clock, Target, TrendingUp } from 'lucide-react';
import type { Transaction } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { formatRupiah } from '@/utils/formatRupiah';
import { formatDate } from '@/utils/dateHelpers';

export default function SaldoPage() {
  const { currentUser, userProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdraw, setShowWithdraw] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(txs);
    });

    return unsub;
  }, [currentUser]);

  const totalPemasukan = transactions
    .filter(t => t.tipe === 'pemasukan' && t.status === 'berhasil')
    .reduce((sum, t) => sum + t.jumlah, 0);

  const totalPengeluaran = transactions
    .filter(t => t.tipe === 'pengeluaran' && t.status === 'berhasil')
    .reduce((sum, t) => sum + Math.abs(t.jumlah), 0);



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'berhasil': return 'text-green-600';
      case 'pending': return 'text-orange-600';
      case 'ditolak': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Masuk untuk melihat saldo</h2>
          <Link to="/masuk" className="text-primary hover:underline font-medium">Masuk Sekarang</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <button onClick={() => setShowDetail(!showDetail)} className="flex items-center gap-2 mb-2">
            <p className="text-white/80 text-sm">Total Potensi Saldo</p>
            {showDetail ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <h1 className="text-3xl font-bold">
            Rp{(userProfile?.saldo || 0).toLocaleString('id-ID')}
          </h1>
          
          {showDetail && (
            <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Total Pemasukan:</span>
                <span className="font-medium">+{formatRupiah(totalPemasukan)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Total Pengeluaran:</span>
                <span className="font-medium">-{formatRupiah(totalPengeluaran)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-card shadow-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Saldo Aktif</p>
                <p className="text-lg font-bold text-gray-900">{formatRupiah(userProfile?.saldo || 0)}</p>
              </div>
            </div>
            <p className="text-xs text-green-600">Bisa dipakai</p>
          </div>
          <div className="bg-white rounded-card shadow-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Saldo Pending</p>
                <p className="text-lg font-bold text-gray-900">{formatRupiah(userProfile?.saldoPending || 0)}</p>
              </div>
            </div>
            <p className="text-xs text-orange-600">Dalam review</p>
          </div>
        </div>

        {/* Withdraw */}
        <div className="bg-white rounded-card shadow-card p-4 mb-6">
          <button
            onClick={() => setShowWithdraw(!showWithdraw)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              <ArrowDownCircle className="w-5 h-5 text-primary" />
              <span className="font-semibold">💳 Tarik Saldo</span>
            </div>
            <span className="text-xs text-gray-500">Min. {formatRupiah(10000)}</span>
          </button>
          
          {showWithdraw && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-4 gap-2 mb-4">
                {['DANA', 'GoPay', 'OVO', 'Bank'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setWithdrawMethod(method)}
                    className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                      withdrawMethod === method ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder={`Jumlah (min. ${formatRupiah(10000)})`}
                className="w-full px-4 py-3 border border-gray-200 rounded-button mb-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                disabled={!withdrawMethod || Number(withdrawAmount) < 10000 || Number(withdrawAmount) > (userProfile?.saldo || 0)}
                className="w-full py-3 bg-primary text-white font-semibold rounded-button hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                Ajukan Penarikan
              </button>
            </div>
          )}
        </div>

        {/* CTA Misi */}
        <Link
          to="/misi-cuan"
          className="flex items-center justify-between bg-gradient-to-r from-secondary to-secondary-light text-white rounded-card p-4 mb-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6" />
            <div>
              <p className="font-semibold">🎯 Kerjakan misi untuk dapat cuan lebih!</p>
              <p className="text-sm text-white/80">12 misi tersedia</p>
            </div>
          </div>
          <span className="text-sm font-medium">Lihat →</span>
        </Link>

        {/* Transaction History */}
        <div className="bg-white rounded-card shadow-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Riwayat Transaksi</h2>
            <Link to="/riwayat" className="text-sm text-primary hover:underline">Lihat Semua</Link>
          </div>
          
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.tipe === 'pemasukan' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {tx.tipe === 'pemasukan' ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowDownCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{tx.deskripsi}</p>
                    <p className="text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${tx.tipe === 'pemasukan' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.tipe === 'pemasukan' ? '+' : '-'}{formatRupiah(Math.abs(tx.jumlah))}
                    </p>
                    <p className={`text-xs ${getStatusColor(tx.status)}`}>
                      {tx.status === 'berhasil' ? '✅' : tx.status === 'pending' ? '⏳' : '❌'} {tx.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Belum ada transaksi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
