import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Target, Filter, Crown, Medal, Award } from 'lucide-react';
import type { Mission, UserMission } from '@/types';
import { useAuth } from '@/context/AuthContext';
import MisiCard from '@/components/shared/MisiCard';
import EmptyState from '@/components/shared/EmptyState';
import { formatRupiah } from '@/utils/formatRupiah';

const kategoriFilters = [
  { key: 'semua', label: 'Semua', icon: '🏷️' },
  { key: 'review', label: 'Review', icon: '⭐' },
  { key: 'share', label: 'Share', icon: '📱' },
  { key: 'download', label: 'Download', icon: '📥' },
  { key: 'referral', label: 'Referral', icon: '🎁' },
  { key: 'survey', label: 'Survey', icon: '📋' },
  { key: 'coba', label: 'Harian', icon: '🎯' },
];

const tabFilters = [
  { key: 'tersedia', label: 'Tersedia' },
  { key: 'diambil', label: 'Diambil' },
  { key: 'selesai', label: 'Selesai' },
];

// Mock leaderboard data - will be replaced with Firestore data
const leaderboardData = [
  { name: 'Budi S.', amount: 125000, rank: 1 },
  { name: 'Ani R.', amount: 98000, rank: 2 },
  { name: 'Dedi K.', amount: 76000, rank: 3 },
];

export default function MisiCuanPage() {
  const { currentUser } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [activeTab, setActiveTab] = useState('tersedia');
  const [activeKategori, setActiveKategori] = useState('semua');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    const q = query(collection(db, 'missions'), where('status', '==', 'aktif'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const misi = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mission));
      setMissions(misi);
      setLoading(false);
    });

    let userMissionsUnsub: (() => void) | undefined;
    if (currentUser) {
      const uq = query(collection(db, 'userMissions'), where('userId', '==', currentUser.uid), orderBy('diambilAt', 'desc'));
      userMissionsUnsub = onSnapshot(uq, (snapshot) => {
        const um = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserMission));
        setUserMissions(um);
      });
    }

    return () => {
      unsub();
      userMissionsUnsub?.();
    };
  }, [currentUser]);

  const filteredMissions = missions.filter((mission) => {
    if (activeKategori !== 'semua' && mission.kategori !== activeKategori) return false;
    
    if (activeTab === 'tersedia') {
      const userMission = userMissions.find(um => um.missionId === mission.id);
      return !userMission || userMission.status === 'ditolak';
    }
    if (activeTab === 'diambil') {
      const userMission = userMissions.find(um => um.missionId === mission.id);
      return userMission && ['diambil', 'dikerjakan', 'disubmit', 'direview'].includes(userMission.status);
    }
    if (activeTab === 'selesai') {
      const userMission = userMissions.find(um => um.missionId === mission.id);
      return userMission && userMission.status === 'berhasil';
    }
    return true;
  });

  const getUserMissionStatus = (missionId: string) => {
    const um = userMissions.find(u => u.missionId === missionId);
    return um?.status;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-500">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-accent" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CariCuan / Misi Cuan</h1>
                <p className="text-sm text-gray-500">Kerjakan misi, dapatkan cuan!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar">
          {tabFilters.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-pill text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button className="flex items-center gap-1 px-4 py-2 rounded-pill text-sm font-medium text-gray-600 bg-white hover:bg-gray-100 transition-colors ml-auto">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Kategori Pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {kategoriFilters.map((kat) => (
            <button
              key={kat.key}
              onClick={() => setActiveKategori(kat.key)}
              className={`flex items-center gap-1 px-4 py-2 rounded-pill text-sm font-medium whitespace-nowrap transition-colors ${
                activeKategori === kat.key
                  ? 'bg-accent text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <span>{kat.icon}</span> {kat.label}
            </button>
          ))}
        </div>

        {/* Mission Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            {filteredMissions.length} misi {activeTab}
          </p>
        </div>

        {/* Missions Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredMissions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMissions.map((mission) => (
              <MisiCard 
                key={mission.id} 
                mission={mission} 
                userMissionStatus={getUserMissionStatus(mission.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState 
            type="missions" 
            title={`Belum ada misi ${activeTab}`}
            description="Misi akan segera tersedia. Silakan kembali lagi nanti."
          />
        )}

        {/* Leaderboard */}
        <div className="mt-12 bg-white rounded-card shadow-card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" /> 🏆 Leaderboard Mingguan
          </h2>
          <div className="space-y-3">
            {leaderboardData.map((entry) => (
              <div key={entry.rank} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {getRankIcon(entry.rank)}
                <div className="flex-1">
                  <span className="font-medium text-sm">{entry.name}</span>
                </div>
                <span className="font-bold text-secondary">{formatRupiah(entry.amount)}</span>
              </div>
            ))}
          </div>
          <Link to="/leaderboard" className="block text-center text-sm text-primary hover:underline mt-4 font-medium">
            Lihat Top 100 →
          </Link>
        </div>
      </div>
    </div>
  );
}
