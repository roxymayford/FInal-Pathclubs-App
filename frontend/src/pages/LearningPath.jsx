import React, { useRef, useState, useEffect } from 'react';
import { 
  Check, 
  Play, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  Maximize, 
  Minimize,
  Sparkles,
  Briefcase,
  Star,
  BookOpen,
  Award,
  Layers,
  Flame,
  Bot,
  Code2,
  Palette,
  ShieldCheck,
  BarChart3,
  Globe2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const FLASK_API = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000/api';

const NODE_SPACING = 240;
const PADDING_LEFT = 140;
const PADDING_RIGHT = 140;

const CAREER_TRACKS = [
  {
    id: 'Data & AI',
    title: 'Data & AI',
    badge: 'Data & AI',
    Icon: Bot,
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #06b6d4 100%)',
    lineGradient: 'from-blue-600 to-cyan-500',
    nodeColor: 'border-blue-600 text-blue-600',
    activeBg: 'bg-blue-600 text-white shadow-blue-200',
    inactiveBg: 'bg-white text-gray-700 border-gray-200 hover:border-blue-300',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-100',
    heroTitle: 'Jalur Belajar Data Science & Artificial Intelligence',
    description: 'Kuasai matematika AI, aljabar linear, probabilitas data, dan algoritma machine learning modern.'
  },
  {
    id: 'Software Development',
    title: 'Software Dev',
    badge: 'Software Dev',
    Icon: Code2,
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a855f7 100%)',
    lineGradient: 'from-violet-600 to-purple-500',
    nodeColor: 'border-violet-600 text-violet-600',
    activeBg: 'bg-violet-600 text-white shadow-violet-200',
    inactiveBg: 'bg-white text-gray-700 border-gray-200 hover:border-violet-300',
    tagColor: 'bg-violet-50 text-violet-700 border-violet-100',
    heroTitle: 'Jalur Belajar Software Engineering & Web Development',
    description: 'Pelajari struktur data, algoritma, arsitektur RESTful API, dan CI/CD pipeline modern.'
  },
  {
    id: 'Design',
    title: 'UI/UX Design',
    badge: 'UI/UX Design',
    Icon: Palette,
    gradient: 'linear-gradient(135deg, #831843 0%, #db2777 50%, #f43f5e 100%)',
    lineGradient: 'from-pink-600 to-rose-500',
    nodeColor: 'border-pink-600 text-pink-600',
    activeBg: 'bg-pink-600 text-white shadow-pink-200',
    inactiveBg: 'bg-white text-gray-700 border-gray-200 hover:border-pink-300',
    tagColor: 'bg-pink-50 text-pink-700 border-pink-100',
    heroTitle: 'Jalur Belajar UI/UX Design & Product Experience',
    description: 'Kuasai visual hierarchy, design system, interaktif prototyping, dan usability testing aplikasi.'
  },
  {
    id: 'Infrastructure & Security',
    title: 'Infra & Security',
    badge: 'Infra & Security',
    Icon: ShieldCheck,
    gradient: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #f97316 100%)',
    lineGradient: 'from-orange-600 to-amber-500',
    nodeColor: 'border-orange-600 text-orange-600',
    activeBg: 'bg-orange-600 text-white shadow-orange-200',
    inactiveBg: 'bg-white text-gray-700 border-gray-200 hover:border-orange-300',
    tagColor: 'bg-orange-50 text-orange-700 border-orange-100',
    heroTitle: 'Jalur Belajar Cloud Infrastructure & Cybersecurity',
    description: 'Pelajari dasar jaringan komputer, enkripsi kriptografi, cloud computing, dan Docker containerization.'
  },
  {
    id: 'Product & Business',
    title: 'Product & Business',
    badge: 'Product & Business',
    Icon: BarChart3,
    gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)',
    lineGradient: 'from-emerald-600 to-teal-500',
    nodeColor: 'border-emerald-600 text-emerald-600',
    activeBg: 'bg-emerald-600 text-white shadow-emerald-200',
    inactiveBg: 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    heroTitle: 'Jalur Belajar Product Management & Strategy',
    description: 'Kuasai product discovery MVP, kerangka kerja Agile Scrum, dan product metrics KPI untuk pertumbuhan bisnis.'
  },
  {
    id: 'all',
    title: 'Semua Jalur',
    badge: 'Semua Jalur',
    Icon: Globe2,
    gradient: 'linear-gradient(135deg, #1f2937 0%, #4338ca 50%, #6366f1 100%)',
    lineGradient: 'from-indigo-600 to-blue-500',
    nodeColor: 'border-indigo-600 text-indigo-600',
    activeBg: 'bg-indigo-600 text-white shadow-indigo-200',
    inactiveBg: 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300',
    tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    heroTitle: 'Jalur Belajar Komprehensif (Seluruh Kurikulum)',
    description: 'Jelajahi seluruh modul materi yang tersedia di database dari setiap disiplin ilmu.'
  }
];

const LearningPath = () => {
  const navigate = useNavigate();
  const { user, dashboardData: data } = useAuth();
  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Career Recommendation & Active Track
  const [recommendedCareer, setRecommendedCareer] = useState(null);
  const [selectedTrackId, setSelectedTrackId] = useState('Data & AI');
  const [allSubjects, setAllSubjects] = useState([]);

  const completedModules = data?.completedModules || [];

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setScrollProgress((scrollLeft / maxScroll) * 100);
      }
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // 1. Fetch user's saved career recommendation
  useEffect(() => {
    const fetchUserRecommendation = async () => {
      const activeUserId = user?.id || localStorage.getItem('user_id');
      if (activeUserId) {
        try {
          const recRes = await fetch(`${FLASK_API}/recommendation/${activeUserId}`);
          if (recRes.ok) {
            const recJson = await recRes.json();
            if (recJson.recommendation && recJson.recommendation.top_career) {
              const top = recJson.recommendation.top_career;
              setRecommendedCareer(top);
              setSelectedTrackId(top);
              return;
            }
          }
        } catch (e) {
          console.warn('Could not load user recommendation:', e);
        }
      }

      // Check localStorage fallback
      try {
        const savedRec = localStorage.getItem('career_recommendation');
        if (savedRec) {
          const parsed = JSON.parse(savedRec);
          if (parsed.top_career) {
            setRecommendedCareer(parsed.top_career);
            setSelectedTrackId(parsed.top_career);
          }
        }
      } catch (_) {}
    };

    fetchUserRecommendation();
  }, [user]);

  // 2. Fetch all subjects & modules from backend
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${FLASK_API}/subjects`);
        if (res.ok) {
          const json = await res.json();
          if (json.subjects && json.subjects.length > 0) {
            setAllSubjects(json.subjects);
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to fetch subjects for learning path:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // 3. Compute roadmap steps whenever allSubjects, selectedTrackId, or completedModules changes
  useEffect(() => {
    if (!allSubjects || allSubjects.length === 0) return;

    let targetMods = [];
    allSubjects.forEach(sub => {
      (sub.modules || []).forEach(mod => {
        const modCareers = mod.careers || ['Semua Karir'];
        const matchesTrack = selectedTrackId === 'all' || 
                             modCareers.includes('Semua Karir') || 
                             modCareers.includes(selectedTrackId);

        if (matchesTrack) {
          targetMods.push({
            ...mod,
            subjectTitle: sub.title,
            subjectColor: sub.color,
            subjectBg: sub.bgColor
          });
        }
      });
    });

    if (targetMods.length > 0) {
      let foundFirstIncomplete = false;
      const totalSteps = targetMods.length;

      const mappedSteps = targetMods.map((m, idx) => {
        const isCompleted = completedModules.includes(m.id);
        let status = 'terkunci';

        if (isCompleted) {
          status = 'selesai';
        } else if (!foundFirstIncomplete) {
          status = 'sedang';
          foundFirstIncomplete = true;
        }

        const leftPx = PADDING_LEFT + idx * NODE_SPACING;

        return {
          id: String(idx + 1).padStart(2, '0'),
          realId: m.id,
          title: m.title,
          description: m.description || `${m.subjectTitle} • ${m.duration || '15 m'}`,
          status,
          position: idx % 2 === 0 ? 'top' : 'bottom',
          leftPx,
          duration: m.duration,
          careers: m.careers || ['Semua Karir'],
          subjectTitle: m.subjectTitle
        };
      });

      setSteps(mappedSteps);
    } else {
      setSteps([]);
    }
  }, [allSubjects, selectedTrackId, completedModules.length]);

  const activeTrackMeta = CAREER_TRACKS.find(t => t.id === selectedTrackId) || CAREER_TRACKS[0];

  const completedCount = steps.filter(s => s.status === 'selesai').length;
  const remainingCount = steps.length - completedCount;
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;
  const activeLineWidth = steps.length > 1 ? Math.min(completedCount, steps.length - 1) * NODE_SPACING : 0;

  const nextActiveStep = steps.find(s => s.status === 'sedang') || steps[0];

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full text-left font-sans">
      <Sidebar user={data?.user} />
      
      <main className="flex-1 overflow-y-auto pt-20 md:pt-8 pb-24 md:pb-10 px-4 sm:px-6 md:px-8 lg:p-10">
        
        {/* Top Header & Intro */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Learning Path</h1>
              {recommendedCareer && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold shadow-xs">
                  <Sparkles size={13} className="text-amber-600 fill-amber-500" />
                  Rekomendasi AI: {recommendedCareer}
                </span>
              )}
            </div>
            <p className="text-gray-500 font-medium text-xs sm:text-sm">
              Jalur belajar interaktif yang dikurasi khusus untuk setiap rekomendasi karir pilihanmu.
            </p>
          </div>
        </div>

        {/* ─── Career Track Switcher Tabs ─────────────────────────────────── */}
        <div className="mb-6 bg-white p-2.5 sm:p-3 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2 px-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={13} className="text-indigo-600" />
              Pilih Jalur Rekomendasi Karir:
            </span>
            {recommendedCareer && (
              <button
                onClick={() => setSelectedTrackId(recommendedCareer)}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Star size={11} className="fill-amber-400 text-amber-500" />
                Kembali ke Rekomendasi Saya
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory scroll-px-3">
            {CAREER_TRACKS.map(track => {
              const isSelected = selectedTrackId === track.id;
              const isUserRec = recommendedCareer === track.id;

              return (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrackId(track.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                    isSelected
                      ? `${track.activeBg} border-transparent shadow-sm scale-[1.02]`
                      : `${track.inactiveBg} hover:bg-gray-50`
                  }`}
                >
                  <track.Icon size={18} className="shrink-0" aria-hidden />
                  <span>{track.title}</span>
                  {isUserRec && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-0.5 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                    }`}>
                      <Star size={10} className="fill-amber-400 text-amber-400" /> AI
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Hero Card Banner (Dynamic per career) ────────────────────────── */}
        <div 
          className="rounded-3xl p-6 md:p-8 text-white shadow-lg mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 md:gap-6 relative overflow-hidden transition-all duration-500"
          style={{ background: activeTrackMeta.gradient }}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Left Side Info */}
          <div className="z-10 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white mb-3 border border-white/20">
              <span className="inline-flex items-center gap-1.5"><activeTrackMeta.Icon size={14} aria-hidden />{activeTrackMeta.badge}</span>
              {recommendedCareer === selectedTrackId && (
                <span className="bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  MATCH 
                </span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight text-white">
              {activeTrackMeta.heroTitle}
            </h2>
            <p className="text-white/90 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed mb-3">
              {activeTrackMeta.description}
            </p>
            <div className="flex items-center gap-3 text-xs text-white/80 font-semibold">
              <span>{steps.length} Modul Terstruktur</span>
              <span>•</span>
              <span>{completedCount} Selesai</span>
              <span>•</span>
              <span>{remainingCount} Tersisa</span>
            </div>
          </div>

          {/* Right Side Progress Component */}
          <div 
            className="z-10 shrink-0 self-start md:self-auto bg-black/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 w-full sm:w-64"
          >
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-white/90">Progress Jalur Ini</span>
              <span className="text-white font-extrabold text-sm">{progressPercent}%</span>
            </div>
            <div 
              className="w-full h-3 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
            >
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out bg-white shadow-xs"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-white/75 mt-2 text-center font-medium">
              {completedCount === steps.length && steps.length > 0
                ? 'Selamat! Kamu telah menuntaskan jalur ini!'
                : `${remainingCount} modul lagi untuk menyelesaikan jalur`}
            </p>
          </div>
        </div>

        {/* ─── Section Perjalanan Belajarmu ─────────────────────────────────── */}
        <div 
          ref={containerRef}
          className={`mb-8 transition-all duration-300 ${
            isFullscreen 
              ? 'fixed inset-0 z-50 bg-white p-6 md:p-10 flex flex-col justify-between overflow-hidden w-screen h-screen' 
              : 'relative'
          }`}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-0.5">Perjalanan Belajar: {activeTrackMeta.title}</h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 font-medium">
                Materi akan terbuka secara bertahap sesuai progres belajarmu di karir ini.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Status Legend */}
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500 bg-white px-4 py-2 rounded-full shadow-xs border border-gray-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span>Selesai</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
                  <span>Sedang dipelajari</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block"></span>
                  <span>Terkunci</span>
                </div>
              </div>

              {/* Exit Fullscreen Button */}
              {isFullscreen && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-full border border-indigo-200/60 shadow-xs cursor-pointer transition-all duration-200"
                  title="Keluar Fullscreen"
                >
                  <Minimize size={15} />
                  <span>Keluar Fullscreen</span>
                </button>
              )}
            </div>
          </div>

          {/* Stepper Roadmap Container */}
          <div 
            onClick={() => !isFullscreen && toggleFullscreen()}
            className={`bg-white rounded-3xl p-6 border border-gray-100 relative transition-all ${
              isFullscreen 
                ? 'flex-1 flex flex-col justify-between my-auto border-0 shadow-none p-2' 
                : 'shadow-sm hover:shadow-md cursor-pointer group'
            }`}
          >
            {/* Fullscreen indicator badge */}
            {!isFullscreen && (
              <div className="absolute top-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 z-30 shadow-xs pointer-events-none">
                <Maximize size={12} /> Klik area untuk Fullscreen
              </div>
            )}

            {/* Scrollable Canvas area */}
            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="overflow-x-auto scrollbar-none flex-1 flex items-center scroll-smooth snap-x snap-mandatory"
            >
              {steps.length === 0 ? (
                <div className="py-20 w-full flex flex-col items-center justify-center text-center text-gray-400">
                  <BookOpen size={48} className="text-gray-200 mb-3" />
                  <h3 className="font-bold text-gray-700 text-base mb-1">Belum Ada Materi untuk Jalur Ini</h3>
                  <p className="text-xs text-gray-400 max-w-sm">
                    Admin dapat menambahkan materi baru dan memilih jalur karir <span className="font-bold">{activeTrackMeta.title}</span> di Admin Dashboard.
                  </p>
                </div>
              ) : (
                <div 
                  className="relative w-full" 
                  style={{ height: '380px', minWidth: `${steps.length > 0 ? PADDING_LEFT + PADDING_RIGHT + (steps.length - 1) * NODE_SPACING : 820}px` }}
                >
                  
                  {/* Background Connecting Line */}
                  <div 
                    className="absolute h-1 bg-gray-200 z-0"
                    style={{ 
                      top: '200px', 
                      left: `${PADDING_LEFT}px`, 
                      width: `${(steps.length - 1) * NODE_SPACING}px`, 
                      transform: 'translateY(-50%)' 
                    }}
                  ></div>
                  
                  {/* Active Colored Progress Line */}
                  {activeLineWidth > 0 && (
                    <div 
                      className="absolute h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-indigo-600 z-0 transition-all duration-500"
                      style={{ 
                        top: '200px', 
                        left: `${PADDING_LEFT}px`, 
                        width: `${activeLineWidth}px`, 
                        transform: 'translateY(-50%)' 
                      }}
                    ></div>
                  )}

                  {steps.map((step) => {
                    const isTop = step.position === 'top';

                    return (
                      <React.Fragment key={step.id}>
                        {/* Node Circle on Line */}
                        <div 
                          className="absolute z-20 flex items-center justify-center pointer-events-none"
                          style={{ 
                            top: '200px', 
                            left: `${step.leftPx}px`, 
                            transform: 'translate(-50%, -50%)' 
                          }}
                        >
                          {step.status === 'selesai' && (
                            <div className="w-7 h-7 rounded-full bg-white border-4 border-emerald-500 shadow-xs flex items-center justify-center">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            </div>
                          )}
                          {step.status === 'sedang' && (
                            <div className="relative flex items-center justify-center">
                              <div className="absolute w-10 h-10 rounded-full bg-indigo-400/20 animate-ping"></div>
                              <div className="w-8 h-8 rounded-full bg-white border-4 border-indigo-600 shadow-sm flex items-center justify-center z-10">
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                              </div>
                            </div>
                          )}
                          {step.status === 'terkunci' && (
                            <div className="w-6 h-6 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                            </div>
                          )}
                        </div>

                        {/* Card Box */}
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (step.status !== 'terkunci') {
                              navigate(`/materi/detail?id=${step.realId || 1}`);
                            }
                          }}
                          className={`absolute w-[min(15rem,68vw)] sm:w-60 p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between z-10 ${
                            step.status === 'selesai'
                              ? 'bg-white border-gray-100 shadow-sm hover:shadow-md cursor-pointer hover:border-emerald-200'
                              : step.status === 'sedang'
                              ? 'bg-white border-indigo-200 shadow-md ring-2 ring-indigo-500/10 cursor-pointer hover:shadow-lg'
                              : 'bg-gray-50/80 border-gray-100 shadow-xs opacity-75 cursor-not-allowed'
                          }`}
                          style={{
                            left: `${step.leftPx}px`,
                            transform: 'translateX(-50%)',
                            ...(isTop 
                              ? { bottom: '224px' } 
                              : { top: '224px' }
                            )
                          }}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                Modul {step.id}
                              </span>
                              {step.status === 'terkunci' ? (
                                <Lock size={14} className="text-gray-400" />
                              ) : step.status === 'selesai' ? (
                                <Check size={14} className="text-emerald-500 stroke-[3]" />
                              ) : (
                                <Play size={12} className="text-indigo-600 fill-indigo-600" />
                              )}
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{step.title}</h3>
                            <p className="text-[11px] text-gray-400 leading-relaxed mb-3 line-clamp-2">
                              {step.description}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                            {step.status === 'selesai' && (
                              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Check size={11} strokeWidth={3} /> Selesai
                              </span>
                            )}
                            {step.status === 'sedang' && (
                              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Play size={9} className="fill-indigo-600" /> Sedang dipelajari
                              </span>
                            )}
                            {step.status === 'terkunci' && (
                              <span className="bg-gray-100 text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Lock size={10} /> Terkunci
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400 font-semibold">{step.duration || '15m'}</span>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dynamic Footer Scroll Bar & Controls */}
            {steps.length > 0 && (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100"
              >
                <button 
                  onClick={() => scroll('left')} 
                  className="p-2 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                  title="Geser Kiri"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex-1 mx-6 max-w-lg bg-gray-100 h-2 rounded-full overflow-hidden relative">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-150 ease-out"
                    style={{ width: `${Math.max(20, scrollProgress)}%` }}
                  ></div>
                </div>

                <button 
                  onClick={() => scroll('right')} 
                  className="p-2 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                  title="Geser Kanan"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

          </div>
        </div>

        {/* ─── Bottom Cards Row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Rekomendasi Berikutnya Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Play size={22} className="fill-indigo-600 ml-0.5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-500" />
                  Rekomendasi Modul Berikutnya: {activeTrackMeta.title}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {nextActiveStep ? nextActiveStep.title : 'Seluruh Materi Selesai!'}
                </h3>
                <p className="text-xs text-gray-400 font-medium max-w-md">
                  {nextActiveStep ? nextActiveStep.description : 'Hebat! Kamu telah menuntaskan seluruh modul di jalur pembelajaran ini.'}
                </p>
              </div>
            </div>

            {nextActiveStep && (
              <button 
                onClick={() => navigate(`/materi/detail?id=${nextActiveStep.realId || 1}`)}
                className="w-full sm:w-auto bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold px-5 py-2.5 rounded-xl shadow-xs hover:shadow-indigo-200 transition-all duration-200 flex items-center justify-center gap-2 shrink-0 cursor-pointer text-sm"
              >
                Mulai Belajar <ArrowRight size={16} />
              </button>
            )}
          </div>

          {/* Ringkasan Jalur Card */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center justify-between">
              <span>Ringkasan Jalur</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                {activeTrackMeta.title}
              </span>
            </h3>
            
            <div className="grid grid-cols-3 gap-2 text-left">
              <div>
                <span className="text-2xl font-bold text-gray-900 block">{completedCount}</span>
                <span className="text-[11px] font-semibold text-gray-400">Modul selesai</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900 block">{remainingCount}</span>
                <span className="text-[11px] font-semibold text-gray-400">Tersisa</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-indigo-600 block">{progressPercent}%</span>
                <span className="text-[11px] font-semibold text-gray-400">Progres</span>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default LearningPath;
