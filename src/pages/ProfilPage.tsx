import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Wallet, Target, Settings, LogOut, ChevronRight, Clock, CheckCircle, Bell, Lock, CreditCard, ClipboardList, HelpCircle, Key } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatRupiah } from '@/utils/formatRupiah';

const tabs = [
  { key: 'produk', label: 'Produk Saya', icon: Package },
  { key: 'saldo', label: 'Saldo', icon: Wallet },
  { key: 'misi', label: 'Misi', icon: Target },
  { key: 'pengaturan', label: 'Pengaturan', icon: Settings },
];

const settingsMenu = [
  { label: 'Edit Profil', icon: User, path: '/akun/edit' },
  { label: 'Ubah Password', icon: Lock, path: '/akun/password' },
  { label: 'Notifikasi', icon: Bell, path: '/akun/notifikasi' },
  { label: 'Metode Pembayaran', icon: CreditCard, path: '/akun/pembayaran' },
  { label: 'Riwayat Transaksi', icon: ClipboardList, path: '/riwayat' },
  { label: 'Redeem License', icon: Key, path: '/redeem' },
  { label: 'Bantuan', icon: HelpCircle, path: '/bantuan' },
];

export default function ProfilPage() {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('produk');

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Masuk untuk melihat profil</h2>
          <Link to="/masuk" className="text-primary hover:underline font-medium">Masuk Sekarang</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl font-bold text-primary">
              {(userProfile?.displayName || currentUser.displayName || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{userProfile?.displayName || currentUser.displayName || 'User'}</h1>
              <p className="text-sm text-gray-500">{currentUser.email}</p>
              <p className="text-xs text-gray-400">Member sejak {new Date(currentUser.metadata.creationTime || Date.now()).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-primary/5 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-primary">🪙 {formatRupiah(userProfile?.saldo || 0)}</p>
              <p className="text-xs text-gray-500">Saldo</p>
            </div>
            <div className="bg-secondary/10 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-secondary">⭐ {userProfile?.totalMisiSelesai || 0}</p>
              <p className="text-xs text-gray-500">Misi Selesai</p>
            </div>
            <div className="bg-accent/10 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-accent">🛒 0</p>
              <p className="text-xs text-gray-500">Pembelian</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-gray-500'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Produk Tab */}
        {activeTab === 'produk' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">📦 Produk Saya</h2>
            <div className="text-center py-12 bg-white rounded-card">
              <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Belum ada produk</h3>
              <Link to="/" className="text-primary hover:underline font-medium">🛒 Jelajahi Produk →</Link>
            </div>
          </div>
        )}

        {/* Saldo Tab */}
        {activeTab === 'saldo' && (
          <div>
            <div className="bg-white rounded-card shadow-card p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">💰 Saldo Cuan</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-bold text-green-600">{formatRupiah(userProfile?.saldo || 0)}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl">
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-xl font-bold text-orange-600">{formatRupiah(userProfile?.saldoPending || 0)}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link to="/saldo" className="flex-1 py-3 bg-primary text-white text-center rounded-button hover:bg-primary-dark transition-colors font-medium">
                  💳 Tarik Saldo
                </Link>
                <Link to="/misi-cuan" className="flex-1 py-3 bg-secondary text-white text-center rounded-button hover:bg-secondary-dark transition-colors font-medium">
                  🎯 Cari Misi
                </Link>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-3">Riwayat</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">+{formatRupiah(10000)} Review</p>
                    <p className="text-xs text-gray-400">28 Jun 2026</p>
                  </div>
                </div>
                <span className="text-xs text-green-600 font-medium">✅ Berhasil</span>
              </div>
            </div>
          </div>
        )}

        {/* Misi Tab */}
        {activeTab === 'misi' && (
          <div>
            <div className="bg-white rounded-card shadow-card p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">🎯 Misi Aktif</h3>
              <div className="flex items-center justify-between py-3 bg-yellow-50 rounded-lg px-4">
                <div>
                  <p className="text-sm font-medium">⏱️ "Review Template"</p>
                  <p className="text-xs text-gray-500">Sisa 8 menit</p>
                </div>
                <Link to="/misi-cuan" className="text-sm text-primary hover:underline font-medium">Lanjutkan →</Link>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-3">🎯 Riwayat Misi</h3>
            <div className="space-y-2">
              {[
                { title: 'Review Pitch Deck', reward: 10000, status: 'berhasil', date: '28 Jun' },
                { title: 'Share IG Story', reward: 5000, status: 'pending', date: '28 Jun' },
                { title: 'Download Template', reward: 2000, status: 'berhasil', date: '25 Jun' },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    {m.status === 'berhasil' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5 text-orange-500" />}
                    <div>
                      <p className="text-sm font-medium">{m.title}</p>
                      <p className="text-xs text-gray-400">{m.date}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-secondary">+{formatRupiah(m.reward)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pengaturan Tab */}
        {activeTab === 'pengaturan' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">⚙️ Pengaturan</h2>
            <div className="bg-white rounded-card shadow-card overflow-hidden">
              {settingsMenu.map((item, i) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${
                    i < settingsMenu.length - 1 ? 'border-b border-gray-50' : ''
                  }`}
                >
                  <item.icon className="w-5 h-5 text-gray-500" />
                  <span className="flex-1 text-sm font-medium text-gray-700">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">🚪 Keluar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
