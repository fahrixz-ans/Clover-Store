import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { ChevronLeft, Clock, Users, RefreshCw, AlertTriangle, Upload, Camera, Link as LinkIcon, CheckCircle, Target, ChevronDown, ChevronUp } from 'lucide-react';
import type { Mission, UserMission } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatRupiah } from '@/utils/formatRupiah';
import { uploadImage } from '@/services/cloudinary';

const kategoriIcons: Record<string, string> = {
  review: '⭐', share: '📱', download: '📥', referral: '🎁', survey: '📋', coba: '🎮',
};

export default function MisiDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [mission, setMission] = useState<Mission | null>(null);
  const [userMission, setUserMission] = useState<UserMission | null>(null);
  const [screenshot, setScreenshot] = useState('');
  const [buktiLink, setBuktiLink] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedReqs, setExpandedReqs] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchMission = async () => {
      const docRef = doc(db, 'missions', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMission({ id: docSnap.id, ...docSnap.data() } as Mission);
      }
      setLoading(false);
    };
    fetchMission();

    // Check if user has taken this mission
    if (currentUser) {
      const uq = collection(db, 'userMissions');
      const unsub = onSnapshot(uq, (snapshot) => {
        const um = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as UserMission))
          .find(u => u.missionId === id && u.userId === currentUser.uid);
        setUserMission(um || null);
      });
      return () => unsub();
    }
  }, [id, currentUser]);

  const handleTakeMission = async () => {
    if (!currentUser || !mission) {
      showToast('Silakan masuk terlebih dahulu', 'warning');
      navigate('/masuk');
      return;
    }

    try {
      const now = Timestamp.now();
      const deadline = new Date();
      deadline.setMinutes(deadline.getMinutes() + mission.estimasiWaktu);
      
      await addDoc(collection(db, 'userMissions'), {
        userId: currentUser.uid,
        missionId: mission.id,
        missionJudul: mission.judul,
        status: 'diambil',
        rewardDiterima: 0,
        rewardStatus: 'pending',
        diambilAt: now,
        deadlineAt: Timestamp.fromDate(deadline),
      });

      setShowSuccess(true);
      showToast('Berhasil ambil misi!', 'success');
    } catch (error) {
      showToast('Gagal mengambil misi', 'error');
    }
  };

  const handleUploadScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file, 'clover-store/missions');
      setScreenshot(url);
      showToast('Screenshot berhasil diupload', 'success');
    } catch (error) {
      showToast('Gagal upload screenshot', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitProof = async () => {
    if (!userMission) return;
    
    try {
      await addDoc(collection(db, 'userMissions'), {
        ...userMission,
        status: 'disubmit',
        buktiScreenshot: screenshot,
        buktiLink: buktiLink,
        disubmitAt: Timestamp.now(),
      });
      showToast('Bukti berhasil dikirim! Menunggu review admin.', 'success');
    } catch (error) {
      showToast('Gagal mengirim bukti', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-background py-12 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Misi tidak ditemukan</h2>
        <Link to="/misi-cuan" className="text-primary hover:underline">← Kembali ke Misi Cuan</Link>
      </div>
    );
  }

  const isTaken = !!userMission;
  const canSubmit = isTaken && ['diambil', 'dikerjakan'].includes(userMission?.status || '');

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Detail Misi</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Mission Header */}
        <div className="bg-white rounded-card shadow-card p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{kategoriIcons[mission.kategori] || '🎯'}</span>
            <h2 className="text-xl font-bold text-gray-900">{mission.judul}</h2>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {mission.estimasiWaktu} menit</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {mission.totalPartisipan} Partisipan</span>
            <span className="flex items-center gap-1"><RefreshCw className="w-4 h-4" /> Maks. {mission.maxAmbil}x</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-secondary">{formatRupiah(mission.reward)}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              mission.status === 'aktif' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              🟢 {mission.status === 'aktif' ? 'Tersedia' : 'Nonaktif'}
            </span>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-orange-50 border border-orange-200 rounded-card p-4 mb-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <p className="text-sm text-orange-700">Hasil kerja diproses maksimal 3 hari kerja setelah submit</p>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-card shadow-card p-6 mb-4">
          <button
            onClick={() => setExpandedReqs(!expandedReqs)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="font-semibold text-gray-900">📋 Persyaratan</h3>
            {expandedReqs ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedReqs && (
            <ul className="space-y-2">
              {mission.persyaratan.map((req, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-secondary shrink-0">•</span> {req}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Steps */}
        <div className="bg-white rounded-card shadow-card p-6 mb-4">
          <button
            onClick={() => setExpandedSteps(!expandedSteps)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="font-semibold text-gray-900">🔨 Langkah Kerja</h3>
            {expandedSteps ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSteps && (
            <ol className="space-y-2">
              {mission.langkahKerja.map((step, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-primary font-bold shrink-0">{i + 1}.</span> {step}
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Submit Proof */}
        {canSubmit && (
          <div className="bg-white rounded-card shadow-card p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">📤 Unggah Bukti</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Screenshot hasil karya:</label>
              <div className="border-2 border-dashed border-gray-200 rounded-card p-6 text-center hover:border-primary transition-colors">
                {screenshot ? (
                  <img src={screenshot} alt="Preview" className="max-w-xs mx-auto rounded-lg mb-2" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">Drag & drop atau klik untuk upload</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadScreenshot}
                  className="hidden"
                  id="screenshot-upload"
                />
                <label
                  htmlFor="screenshot-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-button text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  {uploading ? 'Mengupload...' : screenshot ? 'Ganti Screenshot' : 'Pilih File'}
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Link bukti:</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  value={buktiLink}
                  onChange={(e) => setBuktiLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-button focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmitProof}
                disabled={!screenshot && !buktiLink}
                className="flex-1 py-3 bg-secondary text-white font-semibold rounded-button hover:bg-secondary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" /> Submit Bukti
              </button>
            </div>
          </div>
        )}

        {/* Action Button */}
        {!isTaken && (
          <button
            onClick={handleTakeMission}
            className="w-full py-4 bg-accent text-white font-bold rounded-button hover:bg-accent-dark transition-colors flex items-center justify-center gap-2 text-lg"
          >
            <Target className="w-6 h-6" /> AMBIL MISI
          </button>
        )}

        {isTaken && userMission?.status === 'disubmit' && (
          <div className="w-full py-4 bg-orange-100 text-orange-700 font-bold rounded-button text-center">
            🟠 Menunggu Review Admin
          </div>
        )}

        {isTaken && userMission?.status === 'berhasil' && (
          <div className="w-full py-4 bg-green-100 text-green-700 font-bold rounded-button text-center">
            🟢 Misi Selesai! +{formatRupiah(mission.reward)}
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-sm w-full p-6 text-center animate-in fade-in zoom-in">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Berhasil Ambil Misi!</h3>
            <p className="text-sm text-gray-500 mb-2">Batas waktu: {mission.estimasiWaktu} menit</p>
            <p className="text-sm text-gray-500 mb-6">Selesaikan sebelum deadline</p>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full py-3 bg-primary text-white rounded-button hover:bg-primary-dark transition-colors"
            >
              OK, Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
