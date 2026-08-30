import React from 'react';
import { 
  Brain, 
  Flame, 
  Book, 
  Star, 
  Lock,
  Rocket,
  Sprout,
  Zap,
  Target,
  BookMarked,
  Crown,
  Lightbulb
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const Pencapaian = () => {
  const { dashboardData: data } = useAuth();

  const unlockedIds = data?.unlockedBadges || [];
  
  const badgeDefinitions = [
    { id: 'pemula', name: 'Pemula', icon: Star, desc: 'Mencapai Level 2', timelineIcon: Star },
    { id: 'rajin', name: 'Pelajar Rajin', icon: Book, desc: 'Menyelesaikan modul pertama', timelineIcon: Book },
    { id: 'ahli', name: 'Ahli Materi', icon: Flame, desc: 'Menyelesaikan 3 materi', timelineIcon: Flame },
    { id: 'jenius', name: 'Si Jenius', icon: Brain, desc: 'Menyelesaikan kuis pertama', timelineIcon: Lightbulb },
    { id: 'konsisten', name: 'Konsisten', icon: Flame, desc: '3 hari belajar beruntun', timelineIcon: Zap },
    { id: 'master', name: 'Master Kuis', icon: Star, desc: 'Menyelesaikan 3 kuis adaptif', timelineIcon: Target },
    { id: 'kutu', name: 'Kutu Buku', icon: Book, desc: 'Mencapai Level 5', timelineIcon: BookMarked },
    { id: 'legenda', name: 'Legenda', icon: Brain, desc: 'Mengumpulkan 1000+ XP', timelineIcon: Crown },
  ];

  const allBadges = badgeDefinitions.map(b => {
    if (unlockedIds.includes(b.id)) {
      return { name: b.name, icon: b.icon, locked: false, desc: b.desc };
    }
    return { name: 'Terkunci', icon: Lock, locked: true, desc: b.desc };
  });

  const unlockedCount = unlockedIds.length;

  const completedModulesCount = data.completedModules?.length || 0;
  const completedQuizzesCount = data.completedQuizzes?.length || 0;
  const quizXp = data.quizXp || 0;
  const totalXp = (completedModulesCount * 50) + quizXp;
  const currentLevel = Math.floor(totalXp / 100) + 1;
  const levelProgress = totalXp % 100;

  const streakCount = data.stats?.find(s => s.id === 3)?.value || "1";
  const avgScore = completedQuizzesCount > 0 
    ? Math.min(Math.round(quizXp / (completedQuizzesCount * 10)), 100) 
    : (completedModulesCount > 0 ? 85 : 0);

  const stats = [
    { label: 'Materi Selesai', value: `${completedModulesCount}` },
    { label: 'Quiz Selesai', value: `${completedQuizzesCount}` },
    { label: 'Streak', value: `${streakCount} Hari` },
    { label: 'Nilai Rata-rata', value: `${avgScore}%` },
  ];

  const unlockedBadgeObjects = badgeDefinitions.filter(b => unlockedIds.includes(b.id));

  const timelineItems = unlockedBadgeObjects.length > 0 
    ? unlockedBadgeObjects.map(b => ({
        text: `Membuka badge "${b.name}" (${b.desc})`,
        TimelineIcon: b.timelineIcon
      }))
    : (completedModulesCount > 0 
        ? [{ text: `Menyelesaikan ${completedModulesCount} materi belajar. Terus tingkatkan!`, TimelineIcon: Rocket }]
        : [{ text: 'Belum ada pencapaian. Ayo selesaikan materi pertamamu!', TimelineIcon: Sprout }]);

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full text-left">
      <Sidebar user={data.user} />
      
      <main className="flex-1 overflow-y-auto pt-20 md:pt-8 pb-24 md:pb-10 px-4 sm:px-6 md:px-8 lg:p-10">
        
        {/* Top Hero Banner */}
        <div className="bg-[#6366f1] rounded-3xl p-6 md:p-8 text-white relative mb-6 md:mb-8 shadow-sm flex flex-col justify-between overflow-hidden min-h-[140px] md:min-h-[160px]">
          {/* Decorative Background */}
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
             <Star size={200} fill="currentColor" strokeWidth={0} />
          </div>

          <div className="flex justify-between items-start relative z-10 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">Pencapaian</h1>
              <p className="text-white/80 text-xs sm:text-sm font-medium">Kamu telah membuka {unlockedCount} dari 8 badge.</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl sm:text-2xl font-bold">Level {currentLevel}</h2>
              <p className="text-white/80 text-xs sm:text-sm font-medium">{totalXp} XP</p>
            </div>
          </div>
          
          <div className="relative z-10">
            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${levelProgress}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Left Column (Badges) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50 h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Badge</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allBadges.map((badge, index) => {
                  const isLocked = badge.locked;
                  return (
                    <div 
                      key={index} 
                      className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${
                        isLocked 
                          ? 'border-gray-100 bg-white hover:border-gray-200' 
                          : 'border-indigo-100 bg-white shadow-sm hover:border-indigo-300'
                      }`}
                    >
                      <badge.icon 
                        size={36} 
                        className={`mb-3 ${
                          isLocked ? 'text-gray-300' : 'text-[#4f46e5]'
                        }`} 
                        fill={isLocked ? 'none' : 'currentColor'}
                        strokeWidth={isLocked ? 2 : 1.5}
                      />
                      <span className={`text-sm font-semibold ${
                        isLocked ? 'text-gray-400' : 'text-gray-800'
                      }`}>
                        {badge.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (Stats & Timeline) */}
          <div className="space-y-8">
            
            {/* Statistik */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Statistik</h3>
              
              <div className="space-y-4">
                {stats.map((stat, index) => (
                  <div key={index} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <span className="text-sm text-gray-600 font-medium">{stat.label}</span>
                    <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Timeline</h3>
              
              <div className="relative pl-6 space-y-8 before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-gray-200">
                {timelineItems.map((item, index) => (
                  <div key={index} className="relative">
                    <span className="text-sm text-gray-800 font-medium flex items-center gap-2">
                      <item.TimelineIcon size={18} className="text-indigo-500 shrink-0" /> {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Pencapaian;

