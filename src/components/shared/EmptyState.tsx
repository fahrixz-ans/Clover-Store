import { Package, FileQuestion, ClipboardList, Wallet, Ticket, BookOpen, Target, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  type: 'products' | 'orders' | 'missions' | 'transactions' | 'licenses' | 'blogs' | 'cart' | 'generic';
  title?: string;
  description?: string;
  actionLabel?: string;
  actionPath?: string;
}

const icons = {
  products: Package,
  orders: ClipboardList,
  missions: Target,
  transactions: Wallet,
  licenses: Ticket,
  blogs: BookOpen,
  cart: Inbox,
  generic: FileQuestion,
};

const defaultMessages = {
  products: { title: 'Belum ada produk', desc: 'Produk akan segera tersedia. Silakan kembali lagi nanti.' },
  orders: { title: 'Belum ada pesanan', desc: 'Kamu belum memiliki pesanan apa pun.' },
  missions: { title: 'Belum ada misi', desc: 'Misi belum tersedia saat ini.' },
  transactions: { title: 'Belum ada transaksi', desc: 'Kamu belum memiliki riwayat transaksi.' },
  licenses: { title: 'Belum ada lisensi', desc: 'Kamu belum memiliki lisensi yang aktif.' },
  blogs: { title: 'Belum ada artikel', desc: 'Artikel blog belum tersedia saat ini.' },
  cart: { title: 'Keranjang Kosong', desc: 'Keranjang belanjamu masih kosong. Yuk mulai berbelanja!' },
  generic: { title: 'Data Kosong', desc: 'Tidak ada data yang tersedia saat ini.' },
};

export default function EmptyState({ type, title, description, actionLabel, actionPath }: EmptyStateProps) {
  const Icon = icons[type];
  const defaults = defaultMessages[type];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title || defaults.title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description || defaults.desc}</p>
      {actionLabel && actionPath && (
        <Link
          to={actionPath}
          className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-button hover:bg-primary-dark transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
