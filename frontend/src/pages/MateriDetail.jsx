import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Bell, 
  Search, 
  CheckCircle2, 
  Flame, 
  Check, 
  Sparkles, 
  Trophy, 
  Play, 
  Settings, 
  Maximize, 
  FileText, 
  ChevronRight, 
  Headphones, 
  MousePointer2,
  Video,
  Clock,
  BookOpen
} from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const FLASK_API = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000/api';

// Helper to convert YouTube URL to embed URL
const getEmbedUrl = (url) => {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  return url;
};

const MateriDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const moduleId = parseInt(searchParams.get('id') || '1');

  const { dashboardData: data, setDashboardData } = useAuth();
  const [materi, setMateri] = useState(null);
  const [loading, setLoading] = useState(true);

  const completedModules = data?.completedModules || [];
  const isCompleted = completedModules.includes(moduleId);

  // Default to visual if not set
  const learningStyle = data?.preferences?.learningStyle || 'visual';

  useEffect(() => {
    const fetchMateriDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${FLASK_API}/materi/${moduleId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.materi) {
            setMateri(json.materi);
            return;
          }
        }
      } catch (e) {
        console.warn('Could not fetch dynamic materi detail:', e);
      } finally {
        setLoading(false);
      }

      // Fallback default
      setMateri({
        id: 1,
        title: 'Konsep Dasar Aljabar Linear',
        description: 'Pengantar Matematika untuk AI, vektor, dan matriks.',
        duration: '18:20',
        type: 'Video',
        videoUrl: 'https://www.youtube.com/watch?v=fNk_zzaMoSs',
        content: '### Pengantar Aljabar Linear\nAljabar linear adalah cabang matematika yang berkaitan dengan vektor, ruang vektor, transformasi linear, dan sistem persamaan linear.\n\nDalam AI dan Data Science, data direpresentasikan dalam bentuk matriks multidimensi.',
        xpReward: 50
      });
    };

    fetchMateriDetail();
  }, [moduleId]);

  const handleSelesai = () => {
    if (isCompleted) return;
    
    // Update global dashboard data
    const newData = JSON.parse(JSON.stringify(data)); // Deep copy
    
    // Update Modul Selesai (id: 2)
    const modulStat = newData.stats?.find(s => s.id === 2);
    if (modulStat) {
      modulStat.value = (parseInt(modulStat.value || "0") + 1).toString();
    }
    
    // Update Total XP (id: 4)
    const xpReward = materi?.xpReward || 50;
    const xpStat = newData.stats?.find(s => s.id === 4);
    if (xpStat) {
      xpStat.value = (parseInt(xpStat.value || "0") + xpReward).toString();
    }

    // Add study time
    if (!newData.dailyTarget) newData.dailyTarget = { targetMinutes: 30, currentMinutes: 0 };
    newData.dailyTarget.currentMinutes = (newData.dailyTarget.currentMinutes || 0) + 15;

    // Add Notification
    if (!newData.notifications) newData.notifications = [];
    newData.notifications.unshift({
      id: Date.now() + Math.random(),
      type: 'system',
      unread: true,
      title: `Modul Selesai: ${materi?.title || 'Materi Pembelajaran'}`,
      time: 'Baru saja',
      description: `Selamat! Kamu telah menyelesaikan modul ini dan mendapatkan **+${xpReward} XP** serta **+15 Menit** waktu belajar.`,
      iconName: 'Grid',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
    });

    // Add this module to completedModules
    if (!newData.completedModules) {
      newData.completedModules = [];
    }
    if (!newData.completedModules.includes(moduleId)) {
      newData.completedModules.push(moduleId);
    }
    
    setDashboardData(newData);

    // Give a short delay then redirect
    setTimeout(() => {
      navigate('/materi');
    }, 600);
  };

  const embedUrl = materi?.videoUrl ? getEmbedUrl(materi.videoUrl) : null;

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full text-left font-sans">
      <Sidebar user={data?.user} />
      
      <main className="flex-1 overflow-y-auto pt-20 md:pt-8 pb-24 md:pb-10 px-4 sm:px-6 md:px-8 lg:p-10">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/materi')}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm hover:text-primary transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{materi?.title || 'Memuat materi...'}</h1>
                {(materi?.careers || ['Semua Karir']).map((c, i) => (
                  <span key={i} className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-bold">
                    {c}
                  </span>
                ))}
              </div>
              <p className="text-gray-500 text-sm font-medium">
                {materi?.subjectTitle || 'Modul Pembelajaran'} • {materi?.duration || '15:00'} • {materi?.type || 'Video'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/notifications" className="bg-white p-2.5 rounded-full shadow-sm text-gray-400 hover:text-primary transition-colors relative block">
              <Bell size={20} />
              {data?.notifications?.some(n => n.unread) && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            
            {/* Video / Multimedia Player Area */}
            {embedUrl ? (
              <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-lg border border-gray-100">
                <iframe
                  src={embedUrl}
                  title={materi?.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="relative w-full aspect-video bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 rounded-3xl overflow-hidden shadow-md flex items-center justify-center p-8 text-center text-white">
                <div className="max-w-md">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{materi?.title}</h3>
                  <p className="text-sm text-white/80">{materi?.description || 'Simak materi tertulis di bawah ini.'}</p>
                </div>
              </div>
            )}

            {/* Tentang Materi & Konten Lengkap */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Catatan & Penjelasan Materi</h2>
              </div>
              
              {materi?.description && (
                <p className="text-gray-600 text-base leading-relaxed mb-6 font-medium bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  {materi.description}
                </p>
              )}

              {/* Formatted Content */}
              {materi?.content ? (
                <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed space-y-4 whitespace-pre-line font-normal text-sm md:text-base border-t border-gray-100 pt-6">
                  {materi.content}
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic">Belum ada catatan tambahan untuk materi ini.</p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-6">
                <span className="px-4 py-1.5 bg-indigo-50 text-[#4232c2] rounded-full text-xs font-bold">
                  {materi?.subjectTitle || 'Matematika & AI'}
                </span>
                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
                  +{materi?.xpReward || 50} XP Reward
                </span>
                <span className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                  Tipe: {materi?.type || 'Video'}
                </span>
              </div>
            </div>

          </div>

          {/* Right Column (Sidebar content) */}
          <div className="space-y-6">
            
            {/* Progress Modul */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Status Pembelajaran</h3>
                <span className={`font-bold text-sm ${isCompleted ? 'text-teal-600' : 'text-indigo-600'}`}>
                  {isCompleted ? '100% Selesai' : 'Belum Selesai'}
                </span>
              </div>
              
              <div className="h-2.5 w-full bg-gray-100 rounded-full mb-6 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${isCompleted ? 'bg-teal-500 w-full' : 'bg-indigo-600 w-1/4'}`}
                ></div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isCompleted ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'}`}>
                    <CheckCircle2 size={16} />
                  </div>
                  <span>{isCompleted ? 'Modul Telah Diselesaikan' : 'Selesaikan modul ini untuk XP'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <span>Reward: +{materi?.xpReward || 50} Total XP</span>
                </div>
              </div>

              <button 
                onClick={handleSelesai}
                disabled={isCompleted}
                className={`w-full font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm ${
                  isCompleted 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-md'
                }`}
              >
                <Check size={18} /> {isCompleted ? 'Modul Telah Selesai ✓' : 'Tandai Selesai & Klaim XP'}
              </button>
            </div>

            {/* Rekomendasi AI */}
            <div className="bg-gradient-to-br from-[#4f46e5] to-[#4338ca] rounded-3xl p-6 shadow-md text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Sparkles size={12} className="text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-white/90">Latihan Terkait</span>
              </div>

              <h3 className="text-xl font-bold mb-2">Quiz & Latihan Soal</h3>
              <p className="text-white/80 text-xs leading-relaxed mb-6">
                Uji pemahamanmu setelah menyimak materi ini untuk memperkuat konsep dan menambah XP!
              </p>

              <button 
                onClick={() => navigate('/latihan')}
                className="w-full bg-white text-[#4232c2] hover:bg-gray-50 font-bold py-3 rounded-xl transition-colors text-sm shadow-sm"
              >
                Mulai Latihan Soal
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default MateriDetail;
