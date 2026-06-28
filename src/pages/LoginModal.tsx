import { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function LoginModal({ isOpen, onClose, initialMode = 'login' }: LoginModalProps) {
  const { login, register, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreed && mode === 'register') {
      setError('Kamu harus menyetujui Syarat & Ketentuan');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        showToast('Berhasil masuk!', 'success');
      } else {
        await register(email, password, displayName);
        showToast('Akun berhasil dibuat!', 'success');
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      showToast('Berhasil masuk dengan Google!', 'success');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal masuk dengan Google');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-card max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Close */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold">{mode === 'login' ? 'Masuk' : 'Daftar'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Benefits */}
          <div className="space-y-2 mb-6">
            {[
              '📋 Bisa pantau & simpan transaksi',
              '🎁 Lebih dulu tahu info promo seru',
              '🎯 Kerjakan misi & dapatkan produk GRATIS',
              '🎧 Mudah hubungi bantuan jika ada kendala',
            ].map((benefit, i) => (
              <p key={i} className="text-sm text-gray-600">{benefit}</p>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg mb-4 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nama kamu"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-button focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-button focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-button focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-xs text-gray-500">
                  Dengan mendaftar, kamu menyetujui <button type="button" className="text-primary hover:underline">Syarat & Ketentuan</button> & <button type="button" className="text-primary hover:underline">Kebijakan Privasi</button>
                </span>
              </label>
            )}

            {mode === 'login' && (
              <button type="button" className="text-sm text-primary hover:underline font-medium">
                Lupa Password?
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-white font-semibold rounded-button hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">atau</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 border-2 border-gray-200 rounded-button font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {mode === 'login' ? 'Masuk dengan Google' : 'Daftar dengan Google'}
          </button>

          {/* Toggle Mode */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-primary hover:underline font-medium"
            >
              {mode === 'login' ? 'Daftar Sekarang' : 'Masuk'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
