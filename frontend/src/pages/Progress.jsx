import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  BookOpenCheck, 
  Flame, 
  TrendingUp, 
  Award
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const FLASK_API = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000/api';

const SUBJECT_COLORS = ['#4232c2', '#ea580c', '#0d9488', '#9333ea', '#2563eb', '#16a34a'];

const Progress = () => {
  const { dashboardData: data } = useAuth();
  const [subjectsList, setSubjectsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const completedModules = data?.completedModules || [];
  const completedModulesCount = completedModules.length;
  const streakCount = data?.stats?.find(s => s.id === 3)?.value || "1";
  const targetMinutes = data?.dailyTarget?.targetMinutes || 60;
  const currentMinutes = data?.dailyTarget?.currentMinutes || (completedModulesCount * 15);
  const targetPercent = Math.min(Math.round((currentMinutes / Math.max(targetMinutes, 1)) * 100), 100);
  const completedQuizzesCount = data?.completedQuizzes?.length || 0;
  const quizXp = data?.quizXp || 0;
  const averageQuizScore = completedQuizzesCount > 0 ? Math.min(Math.round(quizXp / (completedQuizzesCount * 10)), 100) : (completedModulesCount > 0 ? 85 : 0);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(`${FLASK_API}/subjects`);
        if (res.ok) {
          const json = await res.json();
          if (json.subjects && json.subjects.length > 0) {
            const mapped = json.subjects.map((s, idx) => {
              const modules = s.modules || [];
              const totalInSub = modules.length;
              const completedInSub = modules.filter(m => completedModules.includes(m.id)).length;
              const percentage = totalInSub > 0 ? Math.round((completedInSub / totalInSub) * 100) : 0;
              const color = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];

              return {
                name: s.title,
                completed: completedInSub,
                total: totalInSub,
                percentage,
                trend: percentage > 0 ? `+${percentage}%` : '0%',
                trendUp: percentage > 0,
                color,
              };
            });
            setSubjectsList(mapped);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch dynamic subjects in Progress:', err);
      }

      // Fallback
      setSubjectsList([
        { name: 'Aljabar Linear', completed: completedModules.filter(id => [1, 2, 3].includes(id)).length, total: 3, percentage: Math.round((completedModules.filter(id => [1, 2, 3].includes(id)).length / 3) * 100), trend: '+33%', trendUp: true, color: '#4232c2' },
        { name: 'Teori Graf', completed: completedModules.filter(id => [4, 5].includes(id)).length, total: 2, percentage: Math.round((completedModules.filter(id => [4, 5].includes(id)).length / 2) * 100), trend: '0%', trendUp: true, color: '#ea580c' },
        { name: 'Probabilitas & Statistika', completed: completedModules.filter(id => [6, 7].includes(id)).length, total: 2, percentage: Math.round((completedModules.filter(id => [6, 7].includes(id)).length / 2) * 100), trend: '0%', trendUp: true, color: '#0d9488' },
        { name: 'Kalkulus Dasar', completed: completedModules.filter(id => [8].includes(id)).length, total: 1, percentage: Math.round((completedModules.filter(id => [8].includes(id)).length / 1) * 100), trend: '0%', trendUp: true, color: '#9333ea' },
      ]);
      setLoading(false);
    };

    fetchSubjects();
  }, [completedModules.length]);

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const todayDayIdx = new Date().getDay();

  const barChartData = daysOfWeek.map((day, idx) => {
    const isToday = idx === todayDayIdx;
    return {
      day,
      value: isToday ? Math.max(1, completedModulesCount) : (idx < todayDayIdx ? Math.max(0, completedModulesCount - (todayDayIdx - idx)) : 0),
      active: isToday,
    };
  });

  const subjects = subjectsList;
  const consistencyPercent = Math.min(Math.round((parseInt(streakCount || '1') / 7) * 100), 100);

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full text-left font-sans">
      <Sidebar user={data.user} />
      
      <main className="flex-1 overflow-y-auto pt-20 md:pt-8 pb-24 md:pb-10 px-4 sm:px-6 md:px-8 lg:p-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1">Progress Belajar</h1>
            <p className="text-gray-500 font-medium text-xs sm:text-sm">Pantau perkembangan belajarmu minggu ini</p>
          </div>
          <div className="flex bg-white rounded-xl shadow-xs p-1 border border-gray-100 self-stretch sm:self-auto justify-center">
            <button className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-[#4232c2] text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs">
              7 Hari
            </button>
            <button className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-gray-500 hover:text-gray-900 text-xs sm:text-sm font-semibold rounded-lg transition-colors">
              30 Hari
            </button>
            <button className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-gray-500 hover:text-gray-900 text-xs sm:text-sm font-semibold rounded-lg transition-colors">
              3 Bulan
            </button>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 flex items-center gap-5 shadow-sm border border-gray-50">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#4232c2] flex items-center justify-center">
              <CalendarCheck size={28} />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-semibold mb-1">Hari Belajar</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">{streakCount}</span>
                <span className="text-gray-500 font-medium text-sm">/ 7 hari</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-6 flex items-center gap-5 shadow-sm border border-gray-50">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <BookOpenCheck size={28} />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-semibold mb-1">Materi Selesai</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">{completedModulesCount}</span>
                <span className="text-gray-500 font-medium text-sm">materi</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 flex items-center gap-5 shadow-sm border border-gray-50">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Flame size={28} fill="currentColor" />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-semibold mb-1">Streak</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">{streakCount}</span>
                <span className="text-gray-500 font-medium text-sm">hari berturut</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50 mb-8 relative">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Aktivitas 7 Hari Terakhir</h2>
              <p className="text-sm text-gray-400 font-medium">Jumlah materi yang diselesaikan per hari</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold">
              <TrendingUp size={14} /> 0%
            </div>
          </div>

          <div className="h-64 flex items-end justify-between relative pl-8">
            {/* Y-axis lines and labels */}
            <div className="absolute left-0 top-0 bottom-8 w-full flex flex-col justify-between text-xs text-gray-400 font-medium">
              <div className="flex items-center gap-4 w-full"><span>6</span><div className="flex-1 border-b border-gray-100"></div></div>
              <div className="flex items-center gap-4 w-full"><span>4</span><div className="flex-1 border-b border-gray-100"></div></div>
              <div className="flex items-center gap-4 w-full"><span>2</span><div className="flex-1 border-b border-gray-100"></div></div>
              <div className="flex items-center gap-4 w-full"><span>0</span><div className="flex-1 border-b border-gray-100"></div></div>
            </div>

            {/* Bars */}
            <div className="w-full flex justify-between items-end h-[calc(100%-2rem)] z-10 px-4 md:px-10">
              {barChartData.map((item, index) => {
                // Calculate height percentage based on max value 7
                const heightPercentage = (item.value / 7) * 100;
                return (
                  <div key={index} className="flex flex-col items-center gap-3 w-12 md:w-16 h-full justify-end">
                    <div 
                      className={`w-full rounded-sm transition-all ${item.active ? 'bg-[#4232c2]' : 'bg-indigo-200'}`}
                      style={{ height: `${heightPercentage}%` }}
                    ></div>
                    <span className="text-xs text-gray-400 font-medium">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Ringkasan Minggu Ini */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50 flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 mb-8">Ringkasan Minggu Ini</h2>
            
            <div className="space-y-6 flex-1">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-600">Konsistensi</span>
                  <span className="text-sm font-bold text-[#4232c2]">{consistencyPercent}%</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4232c2] rounded-full transition-all duration-1000" style={{ width: `${consistencyPercent}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-600">Target Harian</span>
                  <span className="text-sm font-bold text-teal-600">{targetPercent}%</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full transition-all duration-1000" style={{ width: `${targetPercent}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-600">Nilai Rata-rata</span>
                  <span className="text-sm font-bold text-orange-500">{averageQuizScore}%</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full transition-all duration-1000" style={{ width: `${averageQuizScore}%` }}></div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <Award className="text-[#4232c2]" size={20} />
              <span className="text-sm font-bold text-gray-700">
                {completedModulesCount > 0 
                  ? `Hebat! Kamu telah menyelesaikan ${completedModulesCount} materi.` 
                  : 'Ayo mulai selesaikan materi pertamamu hari ini!'}
              </span>
            </div>
          </div>

          {/* Penguasaan per Mata Pelajaran */}
          <div className="bg-transparent flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">Penguasaan per Mata Pelajaran</h2>
            
            <div className="space-y-4">
              {subjects.map((subject, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 flex items-center gap-5">
                  
                  {/* Circular Progress (CSS Mock) */}
                  <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                    <svg className="w-14 h-14 transform -rotate-90">
                      <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                      <circle 
                        cx="28" cy="28" r="24" 
                        stroke={subject.color} 
                        strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray={24 * 2 * Math.PI} 
                        strokeDashoffset={(24 * 2 * Math.PI) - ((subject.percentage / 100) * (24 * 2 * Math.PI))} 
                        className="transition-all duration-1000 ease-in-out"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-bold text-gray-800">{subject.percentage}%</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-0.5">{subject.name}</h3>
                        <p className="text-[11px] text-gray-400 font-medium">{subject.completed} materi selesai</p>
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        subject.trendUp ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {subject.trend}
                      </div>
                    </div>
                    
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${subject.percentage}%`, backgroundColor: subject.color }}></div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default Progress;
