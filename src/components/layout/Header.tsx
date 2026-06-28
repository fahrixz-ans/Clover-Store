import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Coins, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const navLinks = [
  { label: 'Beranda', path: '/' },
  { label: 'Promo', path: '/promo' },
  { label: 'Flash Sale', path: '/flash-sale' },
  { label: 'Misi Cuan', path: '/misi-cuan' },
  { label: 'Blog', path: '/blog' },
  { label: 'Bantuan', path: '/bantuan' },
];

const kategoriDropdown = [
  { label: 'Template', path: '/kategori/template' },
  { label: 'E-Book', path: '/kategori/e-book' },
  { label: 'Font', path: '/kategori/font' },
  { label: 'Icon', path: '/kategori/icon' },
];

export default function Header() {
  const { currentUser, userProfile, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showKategori, setShowKategori] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cari?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Bar */}
      <div className="bg-primary text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-medium">Fahri Xz Store</span>
            <span className="hidden sm:flex items-center gap-1 text-white/80">
              <MapPin className="w-3 h-3" />
              Tanggamus, Lampung
            </span>
          </div>
          <div className="flex items-center gap-3">
            {currentUser ? (
              <button onClick={() => navigate('/saldo')} className="flex items-center gap-1 hover:text-secondary-light transition-colors">
                <Coins className="w-3.5 h-3.5" />
                {userProfile ? `Rp${userProfile.saldo.toLocaleString('id-ID')}` : '0'}
              </button>
            ) : (
              <button onClick={() => navigate('/masuk')} className="hover:text-secondary-light transition-colors">Masuk</button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🍀</span>
            <span className="text-xl font-bold text-primary hidden sm:block">CLOVER STORE</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-pill text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => navigate('/keranjang')} className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
            <button onClick={() => navigate(currentUser ? '/akun' : '/masuk')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <User className="w-5 h-5 text-gray-700" />
            </button>
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="hidden lg:block border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-button transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="relative">
              <button
                onMouseEnter={() => setShowKategori(true)}
                onMouseLeave={() => setShowKategori(false)}
                className="flex items-center gap-1 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-button transition-colors"
              >
                Kategori
                <ChevronDown className="w-4 h-4" />
              </button>
              {showKategori && (
                <div
                  onMouseEnter={() => setShowKategori(true)}
                  onMouseLeave={() => setShowKategori(false)}
                  className="absolute top-full left-0 bg-white shadow-card rounded-card py-2 min-w-[180px] z-50 border border-gray-100"
                >
                  {kategoriDropdown.map((kat) => (
                    <Link
                      key={kat.path}
                      to={kat.path}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      {kat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 top-[120px] bg-white z-40 p-4">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setShowMobileMenu(false)}
                className="px-4 py-3 text-sm font-medium text-gray-700 hover:bg-primary/5 rounded-button"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2">
              <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Kategori</p>
              {kategoriDropdown.map((kat) => (
                <Link
                  key={kat.path}
                  to={kat.path}
                  onClick={() => setShowMobileMenu(false)}
                  className="px-4 py-3 text-sm text-gray-700 hover:bg-primary/5 rounded-button block"
                >
                  {kat.label}
                </Link>
              ))}
            </div>
            {currentUser && (
              <div className="border-t border-gray-100 pt-2 mt-2">
                <button
                  onClick={() => { logout(); setShowMobileMenu(false); }}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-button"
                >
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
