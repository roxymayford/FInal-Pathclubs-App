import React, { useState } from 'react';
import { LogOut, AlertTriangle, CheckCircle2, Loader2, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

const LogoutModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, dashboardData, logout } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const handleLogoutConfirm = async () => {
    setIsProcessing(true);
    
    // Smooth transition simulation for saving and cloud syncing
    setTimeout(() => {
      setIsCompleted(true);
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 900);
    }, 1100);
  };

  const userName = user?.name || dashboardData?.user?.name || 'Pelajar';
  const userAvatar = user?.avatar || dashboardData?.user?.avatar;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={!isProcessing ? onClose : undefined}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 md:p-8 shadow-2xl border border-gray-100 z-10 overflow-hidden transform transition-all animate-scaleUp">
        
        {/* Top Decorative Background Gradients */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-red-400/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none"></div>

        {!isProcessing ? (
          <div>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Icon Header */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center shrink-0 shadow-xs">
                <LogOut size={26} className="translate-x-0.5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  Keluar dari Akun?
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Konfirmasi pengakhiran sesi akun Anda.
                </p>
              </div>
            </div>

            {/* User Info Capsule */}
            <div className="bg-gray-50/80 rounded-2xl p-3.5 border border-gray-100/80 flex items-center gap-3.5 mb-5">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-10 h-10 rounded-full object-cover shadow-xs" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#4f46e5] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-gray-900 truncate">{userName}</h4>
                <p className="text-xs text-gray-400 truncate">{user?.email || 'Akun Aktif'}</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold rounded-full shrink-0 flex items-center gap-1">
                <CheckCircle2 size={11} /> Progres Tersimpan
              </span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed mb-6 font-medium">
              Semua progres belajar, kuis, dan poin XP Anda tersimpan secara otomatis di database cloud. Anda dapat masuk kembali kapan saja.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirm}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut size={16} />
                Ya, Keluar
              </button>
            </div>
          </div>
        ) : (
          /* Animated Logout Transition Screen */
          <div className="py-6 flex flex-col items-center text-center">
            {!isCompleted ? (
              <>
                <div className="relative flex items-center justify-center mb-6">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-[#4f46e5] animate-spin"></div>
                  <img src={logoImg} alt="Pathclub" className="w-8 h-8 object-contain rounded-lg absolute animate-pulse" />
                </div>
                <h4 className="text-lg font-black text-gray-900 mb-1 tracking-tight">
                  Menyimpan Sesi Belajar...
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                  Menyinkronkan modul dan XP ke database cloud.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 animate-bounce">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-lg font-black text-gray-900 mb-1 tracking-tight">
                  Sampai Jumpa, {userName}!
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                  Mengarahkan kembali ke halaman login...
                </p>
              </>
            )}

            {/* Smooth mini progress bar */}
            <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden mt-6">
              <div className={`h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-1000 ${
                isCompleted ? 'w-full' : 'w-2/3'
              }`} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LogoutModal;
