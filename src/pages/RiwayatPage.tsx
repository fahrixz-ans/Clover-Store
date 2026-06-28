import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { ChevronLeft, TrendingUp, TrendingDown, Clock, FileText, RotateCcw } from 'lucide-react';
import type { Transaction } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatRupiah } from '@/utils/formatRupiah';
import { formatDateTime } from '@/utils/dateHelpers';

const tabs = [
  { key: 'semua', label: 'Semua' },
  { key: 'pemasukan', label: 'Pemasukan' },
  { key: 'pengeluaran', label: 'Pengeluaran' },
  { key: 'pending', label: 'Pending' },
];

export default function RiwayatPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState('semua');

  useEffect(() => {
    if (!currentUser) return;
    
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(txs);
    });

    return unsub;
  }, [currentUser]);

  const filtered = transactions.filter((tx) => {
    if (activeTab === 'semua') return true;
    if (activeTab === 'pending') return tx.status === 'pending';
    return tx.tipe === activeTab;
  });

  const groupByDate = (txs: Transaction[]) => {
    const groups: Record<string, Transaction[]> = {};
    txs.forEach((tx) => {
      const date = tx.createdAt instanceof Date ? tx.createdAt : new Date();
      const key = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    });
    return groups;
  };

  const grouped = groupByDate(filtered);

  const getIcon = (tx: Transaction) => {
    if (tx.kategori === 'beli_produk') return <FileText className="w-5 h-5 text-primary" />;
    if (tx.kategori === 'reward_misi') return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (tx.kategori === 'penarikan') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <TrendingUp className="w-5 h-5 text-secondary" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'berhasil': return '✅';
      case 'pending': return '⏳';
      case 'ditolak': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Riwayat Transaksi</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-pill text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transactions */}
        {Object.entries(grouped).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, txs]) => (
              <div key={date}>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3">📅 {date}</p>
                <div className="space-y-2">
                  {txs.map((tx) => (
                    <div key={tx.id} className="bg-white rounded-card shadow-card p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center shrink-0">
                          {getIcon(tx)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{tx.deskripsi}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {formatDateTime(tx.createdAt)} • ID: {tx.id.slice(0, 12).toUpperCase()}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`text-sm font-bold ${tx.tipe === 'pemasukan' ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.tipe === 'pemasukan' ? '+' : '-'}{formatRupiah(Math.abs(tx.jumlah))}
                              </p>
                              <p className="text-xs text-gray-500">
                                {getStatusIcon(tx.status)} {tx.status}
                              </p>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2 mt-3">
                            <button className="text-xs px-3 py-1.5 border border-gray-200 rounded-button text-gray-600 hover:bg-gray-50 flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Detail
                            </button>
                            {tx.status === 'pending' && (
                              <button className="text-xs px-3 py-1.5 border border-orange-200 rounded-button text-orange-600 hover:bg-orange-50 flex items-center gap-1">
                                <RotateCcw className="w-3 h-3" /> Batalkan
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Belum ada transaksi</h3>
            <p className="text-sm text-gray-400">Riwayat transaksi akan muncul di sini</p>
          </div>
        )}
      </div>
    </div>
  );
}
