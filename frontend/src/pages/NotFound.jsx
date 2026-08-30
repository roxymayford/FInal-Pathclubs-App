import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 md:p-16 rounded-3xl shadow-xl max-w-lg w-full text-center border border-gray-100 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <AlertCircle size={40} />
          </div>
          
          <h1 className="text-6xl font-black text-gray-900 mb-2 tracking-tight">404</h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Halaman Tidak Ditemukan</h2>
          
          <p className="text-gray-500 font-medium mb-8 leading-relaxed">
            Ups! Sepertinya Anda tersesat. Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau memang tidak pernah ada.
          </p>
          
          <Link 
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-[#4232c2] hover:bg-[#3426a1] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Home size={18} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
