import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  Calculator, 
  GitBranch, 
  PieChart, 
  BookOpen, 
  FileText, 
  Clock, 
  CheckCircle2,
  Layers,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const FLASK_API = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000/api';

const ICON_COMPONENTS = {
  Calculator,
  GitBranch,
  PieChart,
  BookOpen,
  Layers
};

const LatihanSoal = () => {
  const navigate = useNavigate();
  const { dashboardData: data } = useAuth();
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const completedModules = data?.completedModules || [];
  const completedQuizzes = data?.completedQuizzes || [];
  const completedQuizzesCount = completedQuizzes.length;
  const quizXp = data?.quizXp || 0;
  const avgAccuracy = completedQuizzesCount > 0 
    ? Math.min(Math.round(quizXp / (completedQuizzesCount * 10)), 100) 
    : (completedModules.length > 0 ? 85 : 0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${FLASK_API}/subjects`);
        if (res.ok) {
          const json = await res.json();
          if (json.subjects && json.subjects.length > 0) {
            const mapped = json.subjects.map((sub, idx) => {
              const modules = sub.modules || [];
              const totalModules = modules.length;
              const completedInSub = modules.filter(m => completedModules.includes(m.id)).length;
              const progress = totalModules > 0 ? Math.round((completedInSub / totalModules) * 100) : 0;
              const IconComp = ICON_COMPONENTS[sub.icon] || BookOpen;

              return {
                id: sub.id,
                title: sub.title,
                description: `Kurikulum ${sub.title}`,
                icon: IconComp,
                color: sub.color || 'text-blue-500',
                iconBg: sub.bgColor || 'bg-blue-50',
                iconColor: sub.color || 'text-blue-500',
                progressColor: 'bg-[#4232c2]',
                totalQuizzes: Math.max(totalModules * 2, 5),
                completedQuizzes: completedInSub,
                progress,
              };
            });
            setCategories(mapped);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch subjects in LatihanSoal:', err);
      }

      // Fallback
      setCategories([
        { title: 'Aljabar & Matriks', description: 'Sistem Persamaan, Vektor, dll.', icon: Calculator, iconBg: 'bg-blue-50', iconColor: 'text-blue-500', progressColor: 'bg-blue-600', totalQuizzes: 6, completedQuizzes: completedModules.filter(id => [1, 2, 3].includes(id)).length, progress: Math.min(completedModules.length * 25, 100) },
        { title: 'Teori Graf', description: 'Shortest Path, Tree & Graph', icon: GitBranch, iconBg: 'bg-orange-50', iconColor: 'text-orange-500', progressColor: 'bg-orange-500', totalQuizzes: 4, completedQuizzes: completedModules.filter(id => [4, 5].includes(id)).length, progress: 0 },
        { title: 'Probabilitas & Statistika', description: 'Teorema Bayes, Peluang', icon: PieChart, iconBg: 'bg-green-50', iconColor: 'text-green-500', progressColor: 'bg-green-500', totalQuizzes: 4, completedQuizzes: completedModules.filter(id => [6, 7].includes(id)).length, progress: 0 },
        { title: 'Kalkulus Dasar', description: 'Turunan, Limit, dan Integral', icon: BookOpen, iconBg: 'bg-purple-50', iconColor: 'text-purple-500', progressColor: 'bg-purple-600', totalQuizzes: 3, completedQuizzes: 0, progress: 0 }
      ]);
    };

    fetchCategories();
  }, [completedModules.length]);

  const filteredCategories = categories.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Build real history from notifications / quiz completions
  const quizNotifications = (data.notifications || []).filter(n => n.type === 'quiz');
  const history = quizNotifications.length > 0
    ? quizNotifications.map((qn, idx) => ({
        title: qn.title || 'Latihan Kuis',
        category: 'Trigonometri & AI',
        time: qn.time || 'Baru saja',
        score: avgAccuracy > 0 ? avgAccuracy : 80,
        scoreColor: 'text-[#4232c2]',
        icon: Calculator,
        iconBg: 'bg-indigo-50',
        iconColor: 'text-[#4232c2]'
      }))
    : (completedQuizzesCount > 0 ? [
        {
          title: 'Kuis Adaptif Trigonometri',
          category: 'Matematika Dasar',
          time: 'Baru saja',
          score: avgAccuracy > 0 ? avgAccuracy : 90,
          scoreColor: 'text-[#4232c2]',
          icon: Calculator,
          iconBg: 'bg-indigo-50',
          iconColor: 'text-[#4232c2]'
        }
      ] : []);

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full text-left">
      <Sidebar user={data.user} />
      
      <main className="flex-1 overflow-y-auto pt-20 md:pt-8 pb-24 md:pb-10 px-4 sm:px-6 md:px-8 lg:p-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1">Latihan Soal</h1>
            <p className="text-gray-500 font-medium text-xs sm:text-sm">Pilih topik atau mata pelajaran untuk menguji pemahamanmu.</p>
          </div>
          
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari topik atau kuis..." 
              className="w-full pl-12 pr-4 py-3 bg-white border-transparent shadow-sm rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Left Column (Hero & Categories) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Hero Card */}
            <div className="bg-[#2e2392] rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between items-start md:flex-row md:items-center min-h-[200px]">
              {/* Decorative Background Elements */}
              <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
                <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,100 L100,0 L200,100 L100,200 Z" fill="currentColor" opacity="0.3" transform="translate(50, 50)" />
                  <path d="M0,100 L100,0 L200,100 L100,200 Z" fill="currentColor" opacity="0.5" transform="translate(100, 100)" />
                </svg>
              </div>

              <div className="relative z-10 max-w-lg mb-6 md:mb-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-semibold mb-4">
                  <Sparkles size={14} /> Tantangan AI Harian
                </div>
                <h2 className="text-2xl font-bold mb-2">Kuis Adaptif Trigonometri</h2>
                <p className="text-white/80 text-sm leading-relaxed">
                  Ikuti kuis diagnostik agar AI dapat menyesuaikan materi dengan kemampuanmu.
                </p>
              </div>

              <button 
                onClick={() => navigate('/quiz')}
                className="relative z-10 flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white font-bold px-6 py-3.5 rounded-xl transition-colors shadow-sm whitespace-nowrap cursor-pointer"
              >
                Mulai Kuis <ArrowRight size={18} />
              </button>
            </div>

            {/* Kategori Mata Pelajaran */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Kategori Mata Pelajaran</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCategories.map((cat, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex flex-col">
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cat.iconBg} ${cat.iconColor}`}>
                        <cat.icon size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{cat.title}</h4>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{cat.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 mb-6 mt-auto">
                      <div className="flex items-center gap-1.5">
                        <FileText size={14} /> {cat.totalQuizzes} Kuis
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} /> {cat.completedQuizzes} Selesai
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-700">Tingkat Penguasaan</span>
                        <span className={`text-xs font-bold ${cat.iconColor}`}>{cat.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${cat.progressColor}`} style={{ width: `${cat.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (Stats & History) */}
          <div className="space-y-8">
            
            {/* Statistik Latihan */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
              <h3 className="font-bold text-gray-900 mb-4">Statistik Latihan</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-[#4232c2] mb-1">{completedQuizzesCount}</span>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Total Kuis Selesai</span>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-[#10b981] mb-1">{avgAccuracy}%</span>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Akurasi Rata-rata</span>
                </div>
              </div>
            </div>

            {/* Riwayat Kuis Terakhir */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
              <h3 className="font-bold text-gray-900 mb-6">Riwayat Kuis Terakhir</h3>
              
              <div className="space-y-5 mb-6">
                {history.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconColor}`}>
                        <item.icon size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">{item.title}</h4>
                        <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5 mt-0.5">
                          {item.category} • {item.time}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${item.scoreColor}`}>
                      {item.score}/100
                    </span>
                  </div>
                ))}
              </div>

              <button className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl transition-colors text-sm shadow-sm">
                Lihat Semua Riwayat
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default LatihanSoal;
