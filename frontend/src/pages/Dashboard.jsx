import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import ActiveCourseCard from '../components/ActiveCourseCard';
import ProfileAnalysisCard from '../components/ProfileAnalysisCard';
import RecommendationCard from '../components/RecommendationCard';
import DailyTargetCard from '../components/DailyTargetCard';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';

const FLASK_API = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const { user, dashboardData: data, isLoading } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [dynamicActiveCourse, setDynamicActiveCourse] = useState(null);
  const [dynamicRecommendations, setDynamicRecommendations] = useState([]);
  const [totalMateriCount, setTotalMateriCount] = useState(12);

  const completedModules = data?.completedModules || [];
  const completedCount = completedModules.length;
  const completedQuizzesCount = data?.completedQuizzes?.length || 0;
  const quizXp = data?.quizXp || 0;
  const totalXp = (completedCount * 50) + quizXp;

  useEffect(() => {
    const fetchDashboardContent = async () => {
      try {
        const res = await fetch(`${FLASK_API}/subjects`);
        if (res.ok) {
          const json = await res.json();
          if (json.subjects) {
            setSubjects(json.subjects);
            
            // Flatten all modules
            let allMods = [];
            json.subjects.forEach(sub => {
              (sub.modules || []).forEach(m => {
                allMods.push({ ...m, subjectTitle: sub.title });
              });
            });

            if (allMods.length > 0) {
              setTotalMateriCount(allMods.length);
              
              // Find the first uncompleted module as active course
              const nextMod = allMods.find(m => !completedModules.includes(m.id)) || allMods[0];
              if (nextMod) {
                setDynamicActiveCourse({
                  id: nextMod.id,
                  title: nextMod.title,
                  description: nextMod.description || 'Ayo lanjutkan belajarmu sekarang!',
                  progress: completedModules.includes(nextMod.id) ? 100 : 0,
                  tag: nextMod.subjectTitle || 'Mulai Belajar'
                });
              }

              // Set smart recommendations from uncompleted modules
              const recs = allMods
                .filter(m => !completedModules.includes(m.id))
                .slice(0, 2)
                .map((m, idx) => ({
                  id: m.id,
                  title: m.title,
                  level: m.type === 'Video + Artikel' ? 'Menengah' : 'Dasar',
                  duration: m.duration ? m.duration.replace(':00', '').replace(':', ' m ') : '20 m',
                  bgClass: idx % 2 === 0 ? 'bg-pink-300' : 'bg-indigo-300',
                  type: m.type || 'Visual'
                }));

              if (recs.length > 0) {
                setDynamicRecommendations(recs);
              }
            }
          }
        }
      } catch (e) {
        console.warn('Could not load dynamic dashboard items:', e);
      }

      // Check if user has saved career recommendation
      if (user && user.id) {
        try {
          const recRes = await fetch(`${FLASK_API}/recommendation/${user.id}`);
          if (recRes.ok) {
            const recJson = await recRes.json();
            if (recJson.recommendation && recJson.recommendation.top_career) {
              const top = recJson.recommendation.top_career;
              // Add career recommendation banner item if not empty
              setDynamicRecommendations(prev => {
                const updated = [...prev];
                if (updated.length > 0) {
                  updated[0] = {
                    ...updated[0],
                    title: `Jalur Karir: ${top} (${updated[0].title})`
                  };
                }
                return updated;
              });
            }
          }
        } catch (_) {}
      }
    };

    fetchDashboardContent();
  }, [completedModules.length, user?.id]);

  // Real computed stats
  const streakValue = data?.stats?.find(s => s.id === 3)?.value || '1';
  const displayStats = [
    { id: 1, icon: "Book", value: totalMateriCount.toString(), label: "Materi Tersedia", iconColorClass: "text-blue-500", iconBgClass: "bg-blue-50" },
    { id: 2, icon: "GraduationCap", value: completedCount.toString(), label: "Modul Selesai", iconColorClass: "text-emerald-500", iconBgClass: "bg-emerald-50" },
    { id: 3, icon: "Flame", value: streakValue, label: "Hari Beruntun", iconColorClass: "text-orange-500", iconBgClass: "bg-orange-50" },
    { id: 4, icon: "Trophy", value: totalXp.toString(), label: "Total XP", iconColorClass: "text-primary-dark", iconBgClass: "bg-primary-light/20" },
  ];

  // Real profile analysis calculation
  const learningStyleType = data?.preferences?.learningStyle 
    ? (data.preferences.learningStyle.charAt(0).toUpperCase() + data.preferences.learningStyle.slice(1))
    : 'Visual';

  const conceptScore = Math.min(Math.round((completedCount / Math.max(totalMateriCount, 1)) * 100), 100);
  const quizAccuracyScore = completedQuizzesCount > 0 ? Math.min(quizXp > 0 ? Math.round(quizXp / (completedQuizzesCount * 10)) : 80, 100) : 0;
  const speedScore = completedCount > 0 || completedQuizzesCount > 0 ? Math.min(50 + (completedCount * 10), 100) : 0;


  const displayProfileAnalysis = {
    learningStyle: {
      type: learningStyleType,
      description: data?.preferences?.learningStyle === 'auditory' 
        ? 'Kamu lebih menyerap materi lewat penjelasan audio dan diskusi.'
        : data?.preferences?.learningStyle === 'kinesthetic'
        ? 'Kamu lebih cepat memahami konsep lewat eksperimen dan latihan langsung.'
        : 'Kamu unggul dalam memahami materi lewat diagram, ilustrasi grafis, dan video.'
    },
    skills: [
      { name: 'Pemahaman Konsep', score: conceptScore, colorClass: 'bg-primary-dark' },
      { name: 'Kecepatan Penyelesaian', score: speedScore, colorClass: 'bg-emerald-500' },
      { name: 'Akurasi Latihan Soal', score: quizAccuracyScore, colorClass: 'bg-orange-500' },
    ]
  };

  const activeCourseToRender = dynamicActiveCourse || data?.activeCourse || {
    id: 1,
    title: 'Konsep Dasar Aljabar Linear',
    description: 'Ayo mulai pembelajaran visualmu untuk menguasai konsep matriks dasar!',
    progress: 0,
    tag: 'Mulai Belajar'
  };

  const recommendationsToRender = dynamicRecommendations.length > 0 
    ? dynamicRecommendations 
    : data?.recommendations || [];

  if (isLoading) {
    return <LoadingScreen message="Menyiapkan Dashboard Belajarmu..." subMessage="Memuat kurikulum dan data progresmu dari database..." />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full text-left font-sans">
      <Sidebar user={data?.user} />
      
      <main className="flex-1 overflow-y-auto pt-20 md:pt-8 pb-24 md:pb-10 px-4 sm:px-6 md:px-8 lg:p-10">
        <header className="flex justify-between items-end mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Beranda</h1>
            <p className="text-gray-400 mt-1 font-medium text-xs sm:text-sm">Selamat Pagi {data?.user?.name || 'Pelajar'}. Mari capai target belajarmu hari ini!</p>
          </div>
          <Link to="/notifications" className="bg-white p-2.5 rounded-full shadow-sm text-gray-400 hover:text-primary transition-colors relative block">
            <Bell size={20} />
            {data?.notifications?.some(n => n.unread) && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </Link>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {displayStats.map(stat => (
            <StatCard 
              key={stat.id}
              icon={stat.icon} 
              value={stat.value} 
              label={stat.label} 
              iconColorClass={stat.iconColorClass} 
              iconBgClass={stat.iconBgClass} 
            />
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column (Takes up 2/3 on large screens) */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <ActiveCourseCard course={activeCourseToRender} />
            
            {/* Rekomendasi Section */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base sm:text-lg font-bold text-gray-800">Rekomendasi Berdasarkan Profilmu</h2>
                <Link to="/learning-path" className="text-primary-dark hover:underline text-xs sm:text-sm font-semibold">
                  Lihat Semua
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {recommendationsToRender.map((rec, index) => (
                  <RecommendationCard 
                    key={index} 
                    title={rec.title} 
                    level={rec.level} 
                    duration={rec.duration} 
                    bgClass={rec.bgClass} 
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Right Column (Takes up 1/3 on large screens) */}
          <div className="space-y-6 md:space-y-8">
            <ProfileAnalysisCard profile={displayProfileAnalysis} />
            <DailyTargetCard target={data?.dailyTarget} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
