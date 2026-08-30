import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Calculator, 
  GitBranch, 
  PieChart, 
  Lock,
  Layers,
  Sparkles,
  Briefcase,
  ShieldCheck,
  Globe2,
  Bot,
  Code2,
  Palette,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const FLASK_API = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000/api';

const ICON_MAP = {
  Calculator: Calculator,
  GitBranch: GitBranch,
  PieChart: PieChart,
  BookOpen: BookOpen,
  Layers: Layers,
  ShieldCheck: ShieldCheck,
  Briefcase: Briefcase
};

const CAREER_FILTERS = [
  { id: 'all', name: 'Semua Karir', Icon: Globe2 },
  { id: 'Data & AI', name: 'Data & AI', Icon: Bot },
  { id: 'Software Development', name: 'Software Dev', Icon: Code2 },
  { id: 'Design', name: 'UI/UX Design', Icon: Palette },
  { id: 'Infrastructure & Security', name: 'Infra & Security', Icon: ShieldCheck },
  { id: 'Product & Business', name: 'Product & Business', Icon: BarChart3 },
];

const Materi = () => {
  const navigate = useNavigate();
  const { dashboardData: data } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCareer, setSelectedCareer] = useState('all');

  const completedModules = data?.completedModules || [];

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(`${FLASK_API}/subjects`);
        if (res.ok) {
          const json = await res.json();
          if (json.subjects && json.subjects.length > 0) {
            setSubjects(json.subjects);
            return;
          }
        }
      } catch (e) {
        console.warn('Could not fetch dynamic subjects:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Filter subjects and their modules based on search query & career filter
  const displaySubjects = subjects.map(sub => {
    const filteredModules = (sub.modules || []).filter(mod => {
      const matchTitle = mod.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDesc = mod.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSubject = sub.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = searchQuery ? (matchTitle || matchDesc || matchSubject) : true;

      const modCareers = mod.careers || ['Semua Karir'];
      const matchesCareer = selectedCareer === 'all' || 
                            modCareers.includes('Semua Karir') || 
                            modCareers.includes(selectedCareer);

      return matchesSearch && matchesCareer;
    });

    return {
      ...sub,
      modules: filteredModules
    };
  }).filter(sub => sub.modules.length > 0);

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full text-left font-sans">
      <Sidebar user={data?.user} />
      
      <main className="flex-1 overflow-y-auto pt-20 md:pt-8 pb-24 md:pb-10 px-4 sm:px-6 md:px-8 lg:p-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1">Daftar Materi</h1>
            <p className="text-gray-500 font-medium text-xs sm:text-sm">Pilih topik dan modul yang ingin kamu pelajari berdasarkan rekomendasi karir.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari materi atau topik..." 
              className="w-full pl-12 pr-4 py-3 bg-white border-transparent shadow-sm rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Career Filter Chips */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CAREER_FILTERS.map(cf => {
            const isSelected = selectedCareer === cf.id;
            return (
              <button
                key={cf.id}
                onClick={() => setSelectedCareer(cf.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <cf.Icon size={16} className="shrink-0" />
                <span>{cf.name}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
            <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-sm font-medium">Memuat modul pembelajaran...</p>
          </div>
        ) : displaySubjects.length === 0 ? (
          <div className="py-20 bg-white rounded-3xl p-8 border border-gray-100 text-center flex flex-col items-center justify-center text-gray-400">
            <BookOpen size={48} className="text-gray-200 mb-3" />
            <h3 className="font-bold text-gray-700 text-lg mb-1">Materi Tidak Ditemukan</h3>
            <p className="text-sm text-gray-400 max-w-sm">
              Tidak ada materi yang sesuai dengan pencarian atau filter karir yang dipilih.
            </p>
          </div>
        ) : (
          <div className="space-y-8 md:space-y-10">
            {displaySubjects.map((subject, idx) => {
              const IconComponent = ICON_MAP[subject.icon] || BookOpen;

              return (
                <div key={subject.id || idx} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${subject.bgColor || 'bg-blue-50'} ${subject.color || 'text-blue-600'}`}>
                      <IconComponent size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{subject.title}</h2>
                      <p className="text-sm text-gray-500 font-medium">{(subject.modules || []).length} Modul Tersedia</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(subject.modules || []).map(mod => {
                      const isModCompleted = completedModules.includes(mod.id);
                      const isModLocked = mod.isLocked && !isModCompleted;
                      const modCareers = mod.careers || ['Semua Karir'];

                      return (
                        <div 
                          key={mod.id} 
                          onClick={() => !isModLocked && navigate(`/materi/detail?id=${mod.id}`)}
                          className={`p-6 rounded-2xl border-2 transition-all flex flex-col justify-between h-full ${
                            isModLocked 
                              ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-80' 
                              : 'border-gray-100 bg-white hover:border-primary/30 hover:shadow-md cursor-pointer group'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  isModLocked ? 'bg-gray-200 text-gray-500' : 'bg-indigo-50 text-indigo-700'
                                }`}>
                                  {mod.type || 'Video'}
                                </div>
                                {modCareers.slice(0, 2).map((c, ci) => (
                                  <span key={ci} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                    {c}
                                  </span>
                                ))}
                              </div>
                              {isModLocked ? (
                                <Lock size={18} className="text-gray-400" />
                              ) : isModCompleted ? (
                                <CheckCircle2 size={20} className="text-teal-500" />
                              ) : (
                                <Play size={18} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                              )}
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-primary-dark transition-colors">
                              {mod.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                              {mod.description || 'Pelajari konsep inti dan penerapannya secara bertahap.'}
                            </p>
                          </div>

                          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                              <Clock size={14} />
                              <span>{mod.duration || '15:00'}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-amber-600 font-semibold flex items-center gap-1">
                                <Sparkles size={12} /> +{mod.xpReward || 50} XP
                              </span>
                            </div>
                            {!isModLocked && (
                              <div className="flex items-center gap-1 text-sm font-bold text-primary-dark hover:text-primary transition-colors">
                                {isModCompleted ? 'Pelajari Ulang' : 'Mulai'} <ArrowRight size={16} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
};

export default Materi;
