import React, { useState, useEffect } from 'react';
import { User, CheckCircle2, Camera } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user: authUser, dashboardData: data, setDashboardData, updateUserProfile } = useAuth();
  
  const [profile, setProfile] = useState({
    name: data.user?.name || authUser?.name || '',
    email: authUser?.email || '',
    grade: data.user?.grade || authUser?.grade || 'SMA Kelas 10',
    avatar: data.user?.avatar || authUser?.avatar || ''
  });

  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setProfile(prev => ({
      ...prev,
      name: data.user?.name || authUser?.name || '',
      email: authUser?.email || '',
      grade: data.user?.grade || authUser?.grade || 'SMA Kelas 10',
      avatar: data.user?.avatar || authUser?.avatar || ''
    }));
  }, [data, authUser]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    setIsSaving(true);
    if (updateUserProfile) {
      await updateUserProfile({
        name: profile.name,
        grade: profile.grade,
        avatar: profile.avatar
      });
    } else {
      const newData = JSON.parse(JSON.stringify(data));
      if (!newData.user) newData.user = {};
      newData.user.name = profile.name;
      newData.user.grade = profile.grade;
      newData.user.avatar = profile.avatar;
      setDashboardData(newData);
    }

    setIsSaving(false);
    setShowSaveMessage(true);
    setTimeout(() => {
      setShowSaveMessage(false);
    }, 3000);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full text-left">
      <Sidebar user={data.user || authUser} />
      
      <main className="flex-1 overflow-y-auto pt-20 md:pt-8 pb-24 md:pb-10 px-4 sm:px-6 md:px-8 lg:p-10 relative flex flex-col items-center justify-start md:justify-center">
        {/* Floating Success Notification */}
        <div className={`absolute top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
          showSaveMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
          <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-full shadow-lg border border-emerald-100 flex items-center gap-3 font-bold text-sm">
            <CheckCircle2 size={18} />
            Profil berhasil diperbarui!
          </div>
        </div>

        <div className="w-full max-w-xl">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Profil Saya</h1>
            <p className="text-gray-500 font-medium text-sm">Kelola identitas dan detail akun Anda.</p>
          </header>

          <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-xl border border-gray-100">
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-10">
              <div className="relative group cursor-pointer mb-4">
                <div className="w-32 h-32 rounded-full bg-indigo-50 text-[#4232c2] flex items-center justify-center overflow-hidden border-4 border-white shadow-lg transition-transform group-hover:scale-105">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={56} />
                  )}
                </div>
                
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={28} className="text-white" />
                </div>
                
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  title="Upload Foto Profil"
                />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{profile.name || 'Pelajar'}</h2>
              <p className="text-sm font-semibold text-primary">{profile.grade}</p>
            </div>

            {/* Form Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input 
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4232c2]/20 focus:border-[#4232c2] transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Email Akun</label>
                <input 
                  type="email"
                  name="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3.5 bg-gray-100 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Tingkat / Kelas</label>
                <input 
                  type="text" 
                  name="grade"
                  value={profile.grade}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4232c2]/20 focus:border-[#4232c2] transition-all"
                />
              </div>

              <div className="pt-6">
                <button 
                  onClick={saveProfile}
                  className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold py-4 rounded-2xl transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2 transform hover:-translate-y-0.5"
                >
                  <CheckCircle2 size={20} />
                  Simpan Perubahan
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
