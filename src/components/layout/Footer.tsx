import { Link } from 'react-router-dom';
import { Mail, MessageCircle, MapPin, Globe, Shield, Award } from 'lucide-react';

const infoLinks = [
  { label: 'Tentang Kami', path: '/tentang' },
  { label: 'Syarat & Ketentuan', path: '/syarat-ketentuan' },
  { label: 'Kebijakan Privasi', path: '/kebijakan-privasi' },
  { label: 'Blog', path: '/blog' },
  { label: 'Redeem License', path: '/redeem' },
];

const misiLinks = [
  { label: 'Lihat Misi Tersedia', path: '/misi-cuan' },
  { label: 'Tukar Saldo', path: '/saldo' },
  { label: 'Cara Kerja Misi', path: '/cara-kerja' },
  { label: 'Leaderboard', path: '/leaderboard' },
];

const socialLinks = [
  { label: 'Facebook', icon: '📘' },
  { label: 'Instagram', icon: '📷' },
  { label: 'X', icon: '𝕏' },
  { label: 'TikTok', icon: '🎵' },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🍀</span>
              <span className="text-lg font-bold text-primary">CLOVER STORE</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              PT Fahri Xz Store<br />
              Website store produk digital terpercaya
            </p>
            <div className="flex items-start gap-2 text-sm text-gray-500 mb-2">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              Tanggamus, Lampung
            </div>
            <a 
              href="https://fahrixz-fas.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              fahrixz-fas.vercel.app
            </a>
          </div>

          {/* Misi Cuan */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">🎯 Misi Cuan</h3>
            <ul className="space-y-2">
              {misiLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-gray-500 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informasi */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">📚 Informasi</h3>
            <ul className="space-y-2">
              {infoLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-gray-500 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hubungi Kami */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">💬 Hubungi Kami</h3>
            <div className="space-y-3">
              <a 
                href="mailto:supportcloverstore@gmail.com"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                supportcloverstore@gmail.com
              </a>
              <a 
                href="https://wa.me/6285609949819"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                +62 856-0994-9819
              </a>
            </div>

            {/* Social */}
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">📱 Ikuti Kami</p>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <button key={social.label} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-sm">
                    {social.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">💳 Pembayaran Aman:</span>
              <div className="flex items-center gap-2">
                {['QRIS', 'DANA', 'GoPay', 'OVO', 'Transfer'].map((method) => (
                  <span key={method} className="px-2.5 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                    {method}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-400">
              <Shield className="w-5 h-5" />
              <Award className="w-5 h-5" />
              <Globe className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Layanan Pengaduan */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="text-center sm:text-left">
            <p className="text-xs text-gray-500 mb-1">
              📞 Layanan Pengaduan Konsumen: WhatsApp +62 856-0994-9819 | Email: supportcloverstore@gmail.com
            </p>
            <p className="text-xs text-gray-400">
              Direktorat Jenderal Perlindungan Konsumen dan Tertib Niaga: 0853-1111-1010
            </p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-primary text-white py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-green-400">🟢</span>
            <span className="text-sm">Dijamin gak ada tambahan biaya!</span>
          </div>
          <p className="text-sm text-white/80">
            © 2026 Clover Store by Fahri Xz Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
