import React from 'react';
import logoImg from '../assets/logo.png';

const LoadingScreen = ({ 
  message = "Memuat data...", 
  subMessage = "Menyiapkan pengalaman belajarmu...",
  fullScreen = true 
}) => {
  if (!fullScreen) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-3">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-3 border-indigo-100 border-t-indigo-600 animate-spin"></div>
          <img src={logoImg} alt="Pathclub" className="w-6 h-6 object-contain rounded-md absolute animate-pulse" />
        </div>
        <p className="text-sm font-semibold text-gray-600 animate-pulse">{message}</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md transition-all duration-300">
      {/* Background Soft Glow Orbs */}
      <div className="absolute w-72 h-72 bg-indigo-400/15 rounded-full blur-3xl -top-10 -left-10 animate-pulse pointer-events-none"></div>
      <div className="absolute w-72 h-72 bg-purple-400/15 rounded-full blur-3xl -bottom-10 -right-10 animate-pulse delay-700 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 py-8 text-center bg-white rounded-3xl shadow-xl border border-gray-100/80 mx-4">
        
        {/* Animated Brand Badge & Spin Ring */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Pulsing outer aura */}
          <div className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 animate-ping opacity-50"></div>
          
          {/* Rotating gradient ring */}
          <div className="w-20 h-20 rounded-full border-4 border-transparent border-t-indigo-600 border-r-purple-500 animate-spin"></div>
          
          {/* Inner badge */}
          <div className="absolute w-14 h-14 rounded-2xl bg-white shadow-md border border-indigo-50 flex items-center justify-center overflow-hidden p-1.5">
            <img src={logoImg} alt="Pathclub" className="w-full h-full object-contain rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Text and Messages */}
        <h3 className="text-lg font-bold text-gray-900 mb-1 tracking-tight">
          {message}
        </h3>
        <p className="text-xs text-gray-500 font-medium mb-6">
          {subMessage}
        </p>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
          <div className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-full animate-loading-bar w-full"></div>
        </div>

        {/* Bottom Tag */}
        <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-full text-[11px] font-bold text-indigo-600">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
          Pathclub
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
