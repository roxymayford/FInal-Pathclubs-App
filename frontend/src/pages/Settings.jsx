import React, { useState, useEffect } from 'react';
import { Brain, Bell, Eye, Headphones, MousePointer2, CheckCircle2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user: authUser, dashboardData: data, setDashboardData } = useAuth();
  
  const [learningStyle, setLearningStyle] = useState(data.preferences?.learningStyle || 'visual');
  const [targetMinutes, setTargetMinutes] = useState(data.dailyTarget?.targetMinutes || 30);
  
  const [notifications, setNotifications] = useState(data.preferences?.notifications || {
    dailyReminder: true,
    aiRecommendation: true,
    achievements: false,
  });

  // Sync state if context data updates after mount (e.g., initial fetch from localStorage)
  useEffect(() => {
    setLearningStyle(data.preferences?.learningStyle || 'visual');
    setTargetMinutes(data.dailyTarget?.targetMinutes || 30);
    setNotifications(data.preferences?.notifications || {
      dailyReminder: true,
      aiRecommendation: true,
      achievements: false,
    });
  }, [data, authUser]);

  const [showSaveMessage, setShowSaveMessage] = useState(false);

  const toggleNotification = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const saveSettings = () => {
    const newData = JSON.parse(JSON.stringify(data));
    
    // Update Daily Target
    if (!newData.dailyTarget) newData.dailyTarget = {};
    newData.dailyTarget.targetMinutes = parseInt(targetMinutes);

    // Update Preferences
    newData.preferences = {
      learningStyle,
      notifications
    };

    setDashboardData(newData);
    
    // Show success message
    setShowSaveMessage(true);
    setTimeout(() => {
      setShowSaveMessage(false);
    }, 3000);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full text-left">
      <Sidebar user={data.user || authUser} />
      
      <main className="flex-1 overflow-y-auto pt-20 md:pt-8 pb-24 md:pb-10 px-4 sm:px-6 md:px-8 lg:p-10 relative">
        {/* Floating Success Notification */}
        <div className={`absolute top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
          showSaveMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
          <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-full shadow-lg border border-emerald-100 flex items-center gap-3 font-bold text-sm">
            <CheckCircle2 size={18} />
            Pengaturan berhasil disimpan!
          </div>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Pengaturan</h1>
          <p className="text-gray-500 font-medium text-sm">Sesuaikan profil, preferensi belajar, dan notifikasimu.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Preferences */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Brain size={24} className="text-[#4232c2]" />
                <h2 className="text-xl font-bold text-gray-900">Preferensi AI & Belajar</h2>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-800 mb-1">Gaya Belajar Utama</label>
                <p className="text-xs text-gray-500 mb-4">AI akan memprioritaskan format materi berdasarkan pilihan ini.</p>
                
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => setLearningStyle('visual')}
                    className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-colors ${
                      learningStyle === 'visual' ? 'border-[#4232c2] bg-indigo-50/50 text-[#4232c2]' : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                    }`}
                  >
                    <Eye size={20} className="mb-2" />
                    <span className="text-xs font-bold">Visual</span>
                  </button>
                  <button 
                    onClick={() => setLearningStyle('auditory')}
                    className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-colors ${
                      learningStyle === 'auditory' ? 'border-[#4232c2] bg-indigo-50/50 text-[#4232c2]' : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                    }`}
                  >
                    <Headphones size={20} className="mb-2" />
                    <span className="text-xs font-bold">Auditori</span>
                  </button>
                  <button 
                    onClick={() => setLearningStyle('kinesthetic')}
                    className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-colors ${
                      learningStyle === 'kinesthetic' ? 'border-[#4232c2] bg-indigo-50/50 text-[#4232c2]' : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                    }`}
                  >
                    <MousePointer2 size={20} className="mb-2" />
                    <span className="text-xs font-bold">Kinestetik</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Target Belajar Harian</label>
                <div className="relative">
                  <select 
                    value={targetMinutes}
                    onChange={(e) => setTargetMinutes(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#4232c2]/20 focus:border-[#4232c2] transition-all"
                  >
                    <option value="15">15 Menit</option>
                    <option value="30">30 Menit</option>
                    <option value="45">45 Menit</option>
                    <option value="60">60 Menit</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Bell size={24} className="text-[#4232c2]" />
                <h2 className="text-xl font-bold text-gray-900">Notifikasi</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Pengingat Belajar Harian</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Dapatkan notifikasi untuk menjaga streak belajarmu.</p>
                  </div>
                  <button 
                    onClick={() => toggleNotification('dailyReminder')}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${notifications.dailyReminder ? 'bg-[#4232c2]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifications.dailyReminder ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <hr className="border-gray-100" />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Rekomendasi Materi AI</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Pemberitahuan saat AI menemukan materi yang cocok.</p>
                  </div>
                  <button 
                    onClick={() => toggleNotification('aiRecommendation')}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${notifications.aiRecommendation ? 'bg-[#4232c2]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifications.aiRecommendation ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <hr className="border-gray-100" />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Pencapaian & Badge</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Notifikasi saat kamu membuka badge baru.</p>
                  </div>
                  <button 
                    onClick={() => toggleNotification('achievements')}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${notifications.achievements ? 'bg-[#4232c2]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifications.achievements ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

          </div>
      </main>
    </div>
  );
};

export default Settings;
