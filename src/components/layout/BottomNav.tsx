import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Target, ShoppingCart, User } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Beranda', icon: Home },
  { path: '/cari', label: 'Cari', icon: Search },
  { path: '/misi-cuan', label: 'Misi', icon: Target },
  { path: '/keranjang', label: 'Cart', icon: ShoppingCart },
  { path: '/akun', label: 'Saya', icon: User },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 lg:hidden safe-area-pb">
      <div className="flex items-center justify-around py-1.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
