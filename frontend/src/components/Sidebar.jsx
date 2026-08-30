import { useState } from 'react';
import { 
  Home, 
  BarChart2, 
  BookOpen, 
  PenTool, 
  Award, 
  Compass, 
  Settings, 
  LogOut, 
  User, 
  ChevronUp, 
  Route,
  Menu,
  X,
  Bell,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import LogoutModal from './LogoutModal';

const Sidebar = ({ user: propUser }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user: authUser, dashboardData, logout } = useAuth();
  const { isDesktopCollapsed, toggleDesktopSidebar, isMobileDrawerOpen, setIsMobileDrawerOpen } = useSidebar();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const activeUser = propUser || authUser || dashboardData?.user;

  const menuItems = [
    { name: 'Beranda', icon: Home, path: '/dashboard' },
    { name: 'Progress Belajar', icon: BarChart2, path: '/progress' },
    { name: 'Learning Path', icon: Route, path: '/learning-path' },
    { name: 'Materi', icon: BookOpen, path: '/materi' },
    { name: 'Latihan Soal', icon: PenTool, path: '/latihan' },
    { name: 'Pencapaian', icon: Award, path: '/pencapaian' },
    { name: 'Rekomendasi Karir', icon: Compass, path: '/rekomendasi' },
    { name: 'Pengaturan', icon: Settings, path: '/settings' },
  ];

  // 4 main quick items for mobile bottom bar
  const mobileBottomNavItems = [
    { name: 'Beranda', icon: Home, path: '/dashboard' },
    { name: 'Jalur', icon: Route, path: '/learning-path' },
    { name: 'Materi', icon: BookOpen, path: '/materi' },
    { name: 'Latihan', icon: PenTool, path: '/latihan' },
  ];

  const hasUnreadNotification = dashboardData?.notifications?.some(n => n.unread);

  return (
    <>
      {/* ─── DESKTOP EXPAND TRIGGER (Strip 3 / Hamburger Icon when hidden) ─────── */}
      {isDesktopCollapsed && (
        <button
          onClick={toggleDesktopSidebar}
          className="hidden md:flex fixed top-4 left-4 z-40 items-center justify-center w-11 h-11 bg-white/95 hover:bg-white text-gray-700 hover:text-primary-dark border border-gray-200/90 rounded-2xl shadow-md hover:shadow-lg backdrop-blur-md transition-all duration-200 active:scale-95 cursor-pointer group"
          title="Tampilkan Sidebar (Strip 3)"
          aria-label="Tampilkan Sidebar"
        >
          <Menu size={22} className="text-gray-700 group-hover:text-primary-dark transition-transform group-hover:scale-110" />
        </button>
      )}

      {/* ─── DESKTOP SIDEBAR (md and above) ─────────────────────────────────── */}
      <aside
        className={`bg-white h-screen flex-col shadow-sm rounded-r-3xl sticky top-0 overflow-y-auto hidden md:flex font-sans z-30 shrink-0 transition-all duration-300 ease-in-out ${
          isDesktopCollapsed
            ? 'w-0 opacity-0 overflow-hidden pointer-events-none p-0 shadow-none border-none'
            : 'w-64 opacity-100'
        }`}
      >
        <div className={`p-6 min-w-[16rem] transition-opacity duration-200 ${isDesktopCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-dark to-primary-light flex items-center justify-center text-white shadow-xs shrink-0">
                <Sparkles size={18} />
              </div>
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-dark to-primary-light truncate">Project ISC</span>
            </div>
            <button
              onClick={toggleDesktopSidebar}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
              title="Sembunyikan Sidebar (Strip 3)"
              aria-label="Sembunyikan Sidebar"
            >
              <Menu size={19} />
            </button>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm ${
                    isActive
                      ? 'bg-primary-light/10 text-primary-dark shadow-sm font-bold'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon size={19} className={isActive ? 'text-primary-dark' : 'text-gray-400'} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={`mt-auto p-4 border-t border-gray-100 relative min-w-[16rem] transition-opacity duration-200 ${isDesktopCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          {/* Popover Menu */}
          {isProfileMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-100 shadow-xl rounded-2xl py-2 z-50 overflow-hidden transform transition-all animate-scaleUp">
              <Link 
                to="/profile" 
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <User size={16} />
                Lihat Profil
              </Link>
              <button 
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setIsLogoutModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                Keluar
              </button>
            </div>
          )}

          {/* User Toggle */}
          <div 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className={`flex items-center justify-between cursor-pointer group p-2 rounded-xl transition-colors ${isProfileMenuOpen ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-3">
              {activeUser?.avatar ? (
                <img src={activeUser.avatar} alt="User Avatar" className="w-9 h-9 rounded-full object-cover shadow-sm" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-50 text-[#4f46e5] font-bold flex items-center justify-center shadow-sm text-sm">
                  {activeUser?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="min-w-0">
                <span className="font-semibold text-gray-800 text-sm block max-w-[90px] truncate">{activeUser?.name || 'User'}</span>
                <span className="text-[11px] text-gray-400 font-medium block truncate">{activeUser?.grade || 'Pelajar'}</span>
              </div>
            </div>
            <ChevronUp size={18} className={`text-gray-400 group-hover:text-primary transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </aside>

      {/* ─── MOBILE TOP APP BAR (iOS / Android) ───────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 flex items-center justify-between z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setIsMobileDrawerOpen(true)}
            className="p-2 -ml-1 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
            aria-label="Buka Menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary-dark to-primary-light">
              Project ISC
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link 
            to="/notifications" 
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors relative"
          >
            <Bell size={20} />
            {hasUnreadNotification && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            )}
          </Link>
          <Link to="/profile" className="p-0.5 rounded-full border border-gray-200">
            {activeUser?.avatar ? (
              <img src={activeUser.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-[#4f46e5] font-bold flex items-center justify-center text-xs">
                {activeUser?.name?.charAt(0) || 'U'}
              </div>
            )}
          </Link>
        </div>
      </header>

      {/* ─── MOBILE SLIDE-OUT DRAWER (iOS / Android) ─────────────────────────── */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fadeIn"
          />

          {/* Drawer Body */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-slideRight">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-dark to-primary-light flex items-center justify-center text-white shadow-xs">
                  <Sparkles size={16} />
                </div>
                <span className="font-black text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary-dark to-primary-light">
                  Project ISC
                </span>
              </div>
              <button 
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Info Card in Drawer */}
            <Link 
              to="/profile" 
              onClick={() => setIsMobileDrawerOpen(false)}
              className="m-4 p-3.5 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 rounded-2xl border border-indigo-100/60 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {activeUser?.avatar ? (
                  <img src={activeUser.avatar} alt="Avatar" className="w-11 h-11 rounded-full object-cover shadow-xs" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#4f46e5] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {activeUser?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{activeUser?.name || 'User'}</h4>
                  <p className="text-[11px] text-gray-500 font-medium truncate">{activeUser?.email || 'Akun Pembelajar'}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:text-[#4f46e5] transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Menu Navigation Links */}
            <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
              {menuItems.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-primary-light/10 text-primary-dark font-bold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon size={19} className={isActive ? 'text-primary-dark' : 'text-gray-400'} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Drawer Footer (Logout) */}
            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  setIsLogoutModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-sm transition-colors cursor-pointer active:scale-98"
              >
                <LogOut size={17} />
                Keluar dari Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MOBILE BOTTOM TAB BAR (iOS / Android) ──────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 px-2 py-1.5 flex items-center justify-around z-40 shadow-lg safe-area-inset-bottom">
        {mobileBottomNavItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary-dark font-bold scale-105'
                  : 'text-gray-400 hover:text-gray-700 font-medium'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} className={isActive ? 'text-primary-dark' : 'text-gray-400'} />
              <span className="text-[10px] mt-0.5">{item.name}</span>
            </Link>
          );
        })}

        {/* 5th Tab: Menu Drawer Toggle */}
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-700 font-medium ${
            ['/progress', '/pencapaian', '/rekomendasi', '/settings', '/profile'].includes(currentPath)
              ? 'text-primary-dark font-bold'
              : ''
          }`}
        >
          <Menu size={20} strokeWidth={1.8} />
          <span className="text-[10px] mt-0.5">Lainnya</span>
        </button>
      </div>

      {/* Modern Logout Modal */}
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
      />
    </>
  );
};

export default Sidebar;
