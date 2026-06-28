import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import LoginModal from '@/pages/LoginModal';
import HomePage from '@/pages/HomePage';
import ProdukDetailPage from '@/pages/ProdukDetailPage';
import CheckoutPage from '@/pages/CheckoutPage';
import ThankYouPage from '@/pages/ThankYouPage';
import MisiCuanPage from '@/pages/MisiCuanPage';
import MisiDetailPage from '@/pages/MisiDetailPage';
import SaldoPage from '@/pages/SaldoPage';
import RiwayatPage from '@/pages/RiwayatPage';
import RedeemPage from '@/pages/RedeemPage';
import BlogPage from '@/pages/BlogPage';
import BlogDetailPage from '@/pages/BlogDetailPage';
import ProfilPage from '@/pages/ProfilPage';
import CartPage from '@/pages/CartPage';
import SearchPage from '@/pages/SearchPage';
import KategoriPage from '@/pages/KategoriPage';

function AppContent() {
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [loginMode] = useState<'login' | 'register'>('login');

  const isAuthPage = location.pathname === '/masuk' || location.pathname === '/daftar';
  const hideLayout = isAuthPage;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!hideLayout && <Header />}
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/produk/:slug" element={<ProdukDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/thank-you/:id" element={<ThankYouPage />} />
          <Route path="/misi-cuan" element={<MisiCuanPage />} />
          <Route path="/misi-cuan/:id" element={<MisiDetailPage />} />
          <Route path="/saldo" element={<SaldoPage />} />
          <Route path="/riwayat" element={<RiwayatPage />} />
          <Route path="/redeem" element={<RedeemPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/akun" element={<ProfilPage />} />
          <Route path="/keranjang" element={<CartPage />} />
          <Route path="/cari" element={<SearchPage />} />
          <Route path="/kategori/:slug" element={<KategoriPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {!hideLayout && <Footer />}
      {!hideLayout && <BottomNav />}

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        initialMode={loginMode}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
