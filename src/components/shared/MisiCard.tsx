import { Clock, Users, RefreshCw, ChevronRight } from 'lucide-react';
import type { Mission } from '@/types';
import { formatRupiah } from '@/utils/formatRupiah';
import { Link } from 'react-router-dom';

interface MisiCardProps {
  mission: Mission;
  userMissionStatus?: string;
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  tersedia: { label: '🟢 Tersedia', bg: 'bg-green-50', text: 'text-green-700' },
  diambil: { label: '🔵 Diambil', bg: 'bg-blue-50', text: 'text-blue-700' },
  dikerjakan: { label: '🟡 Dikerjakan', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  disubmit: { label: '🟠 Direview', bg: 'bg-orange-50', text: 'text-orange-700' },
  berhasil: { label: '🟢 Selesai', bg: 'bg-green-50', text: 'text-green-700' },
  ditolak: { label: '🔴 Ditolak', bg: 'bg-red-50', text: 'text-red-700' },
  dibatasi: { label: '🟠 Dibatasi', bg: 'bg-orange-50', text: 'text-orange-700' },
};

const kategoriIcons: Record<string, string> = {
  review: '⭐',
  share: '📱',
  download: '📥',
  referral: '🎁',
  survey: '📋',
  coba: '🎮',
};

export default function MisiCard({ mission, userMissionStatus }: MisiCardProps) {
  const status = userMissionStatus ? statusConfig[userMissionStatus] : statusConfig['tersedia'];

  return (
    <div className="bg-white rounded-card shadow-card border border-gray-50 overflow-hidden hover:shadow-card-hover transition-all">
      <div className="p-4">
        {/* Category & Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{kategoriIcons[mission.kategori] || '🎯'}</span>
            <span className="text-xs font-semibold uppercase text-gray-500 tracking-wide">{mission.kategori}</span>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-1">{mission.judul}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{mission.deskripsi}</p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {mission.estimasiWaktu} menit
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {mission.totalPartisipan.toLocaleString('id-ID')} Partisipan
          </div>
          <div className="flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            Maks. {mission.maxAmbil}x
          </div>
        </div>

        {/* Reward & Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-secondary">{formatRupiah(mission.reward)}</span>
            {mission.maxPerHari && (
              <span className="text-xs text-gray-400">({mission.maxPerHari}x/hari)</span>
            )}
          </div>
          <Link
            to={`/misi-cuan/${mission.id}`}
            className="flex items-center gap-1 px-4 py-2 bg-accent text-white text-sm font-medium rounded-button hover:bg-accent-dark transition-colors"
          >
            Detail
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
