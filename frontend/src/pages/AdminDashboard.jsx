import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  BookOpen, 
  Layers, 
  Users, 
  Lock, 
  Unlock, 
  Video, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Filter,
  FolderPlus,
  RefreshCw,
  Award,
  ShieldCheck,
  KeyRound,
  LogOut,
  EyeOff,
  UserCheck,
  ArrowLeft,
  Check,
  Briefcase,
  Bot,
  Code2,
  Palette,
  BarChart3,
  Globe2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AdminLogoutModal from '../components/AdminLogoutModal';
import { useAuth } from '../context/AuthContext';

const FLASK_API = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000/api';

const AVAILABLE_CAREERS = [
  { id: 'Data & AI', name: 'Data & AI', Icon: Bot, badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'Software Development', name: 'Software Development', Icon: Code2, badgeClass: 'bg-violet-50 text-violet-700 border-violet-200' },
  { id: 'Design', name: 'Design', Icon: Palette, badgeClass: 'bg-pink-50 text-pink-700 border-pink-200' },
  { id: 'Infrastructure & Security', name: 'Infrastructure & Security', Icon: ShieldCheck, badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'Product & Business', name: 'Product & Business', Icon: BarChart3, badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { dashboardData: data } = useAuth();

  // ─── Admin Authentication Gate ─────────────────────────────────────────────
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      const savedAuth = localStorage.getItem('adminAuth');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        return parsed && parsed.role === 'admin';
      }
    } catch (_) {}
    return false;
  });

  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState('');
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);

  // State Data
  const [subjects, setSubjects] = useState([]);
  const [materiList, setMateriList] = useState([]);
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalMateri: 0,
    totalUsers: 0,
    totalRecommendations: 0
  });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [selectedCareerFilter, setSelectedCareerFilter] = useState('all');

  // Modals
  const [isMateriModalOpen, setIsMateriModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [materiToDelete, setMateriToDelete] = useState(null);
  const [isAdminLogoutModalOpen, setIsAdminLogoutModalOpen] = useState(false);

  // Editing state
  const [editingMateri, setEditingMateri] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);

  // Form states for Materi
  const [materiForm, setMateriForm] = useState({
    subjectId: '',
    title: '',
    description: '',
    duration: '15:00',
    type: 'Video',
    videoUrl: '',
    content: '',
    xpReward: 50,
    isLocked: false,
    order: 0,
    careers: ['Semua Karir']
  });

  // Form states for Subject
  const [subjectForm, setSubjectForm] = useState({
    title: '',
    icon: 'BookOpen',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    order: 0
  });

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Handle Admin Login Submission
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminAuthError('');
    setAdminAuthLoading(true);

    try {
      const res = await fetch(`${FLASK_API}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword
        })
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        const authPayload = {
          username: adminUsername,
          role: 'admin',
          loggedInAt: new Date().toISOString()
        };
        localStorage.setItem('adminAuth', JSON.stringify(authPayload));
        setIsAdminAuthenticated(true);
        showToast(`Selamat datang, Admin ${adminUsername}!`);
        fetchData();
      } else {
        // Direct credential fallback
        if (adminUsername === 'iscLP' && adminPassword === 'kelompok9') {
          const authPayload = {
            username: 'iscLP',
            role: 'admin',
            loggedInAt: new Date().toISOString()
          };
          localStorage.setItem('adminAuth', JSON.stringify(authPayload));
          setIsAdminAuthenticated(true);
          showToast('Selamat datang, Admin iscLP!');
          fetchData();
        } else {
          setAdminAuthError(resData.error || 'Username atau password admin salah!');
        }
      }
    } catch (err) {
      if (adminUsername === 'iscLP' && adminPassword === 'kelompok9') {
        const authPayload = {
          username: 'iscLP',
          role: 'admin',
          loggedInAt: new Date().toISOString()
        };
        localStorage.setItem('adminAuth', JSON.stringify(authPayload));
        setIsAdminAuthenticated(true);
        showToast('Selamat datang, Admin iscLP!');
        fetchData();
      } else {
        setAdminAuthError('Kombinasi username atau password salah.');
      }
    } finally {
      setAdminAuthLoading(false);
    }
  };

  // Handle Admin Logout (called by AdminLogoutModal after animation)
  const handleAdminLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAdminAuthenticated(false);
    setAdminUsername('');
    setAdminPassword('');
  };

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Subjects & their nested modules
      const subRes = await fetch(`${FLASK_API}/subjects`);
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubjects(subData.subjects || []);
      }

      // 2. Fetch all flat materi
      const matRes = await fetch(`${FLASK_API}/materi`);
      if (matRes.ok) {
        const matData = await matRes.json();
        setMateriList(matData.materi || []);
      }

      // 3. Fetch admin stats
      const statsRes = await fetch(`${FLASK_API}/admin/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchData();
    }
  }, [isAdminAuthenticated]);

  // Handle Open Create Materi Modal
  const handleOpenCreateMateri = () => {
    setEditingMateri(null);
    setMateriForm({
      subjectId: subjects.length > 0 ? subjects[0].id : '',
      title: '',
      description: '',
      duration: '15:00',
      type: 'Video',
      videoUrl: '',
      content: '',
      xpReward: 50,
      isLocked: false,
      order: materiList.length + 1,
      careers: ['Semua Karir']
    });
    setIsMateriModalOpen(true);
  };

  // Handle Open Edit Materi Modal
  const handleOpenEditMateri = (materi) => {
    setEditingMateri(materi);
    setMateriForm({
      subjectId: materi.subjectId || (subjects[0]?.id || ''),
      title: materi.title || '',
      description: materi.description || '',
      duration: materi.duration || '15:00',
      type: materi.type || 'Video',
      videoUrl: materi.videoUrl || '',
      content: materi.content || '',
      xpReward: materi.xpReward || 50,
      isLocked: Boolean(materi.isLocked),
      order: materi.order || 0,
      careers: (materi.careers && materi.careers.length > 0) ? materi.careers : ['Semua Karir']
    });
    setIsMateriModalOpen(true);
  };

  // Career Selection Helper for Form
  const toggleCareerSelection = (careerId) => {
    setMateriForm(prev => {
      let current = [...(prev.careers || [])];
      
      if (careerId === 'Semua Karir') {
        return { ...prev, careers: ['Semua Karir'] };
      }

      // If "Semua Karir" was currently selected, remove it
      current = current.filter(c => c !== 'Semua Karir');

      if (current.includes(careerId)) {
        current = current.filter(c => c !== careerId);
        // If nothing left, fallback to Semua Karir
        if (current.length === 0) {
          current = ['Semua Karir'];
        }
      } else {
        current.push(careerId);
        // If all 5 careers selected, simplify to 'Semua Karir'
        if (current.length === AVAILABLE_CAREERS.length) {
          current = ['Semua Karir'];
        }
      }

      return { ...prev, careers: current };
    });
  };

  // Handle Submit Materi Form (Create / Update)
  const handleSubmitMateri = async (e) => {
    e.preventDefault();
    if (!materiForm.title.trim()) {
      showToast('Judul materi tidak boleh kosong', 'error');
      return;
    }
    if (!materiForm.subjectId) {
      showToast('Pilih kategori materi terlebih dahulu', 'error');
      return;
    }

    try {
      const url = editingMateri 
        ? `${FLASK_API}/materi/${editingMateri.id}`
        : `${FLASK_API}/materi`;
      
      const method = editingMateri ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(materiForm)
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Terjadi kesalahan saat menyimpan materi');
      }

      showToast(editingMateri ? 'Materi berhasil diperbarui!' : 'Materi baru berhasil ditambahkan!');
      setIsMateriModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan materi', 'error');
    }
  };

  // Handle Delete Materi
  const handleConfirmDelete = async () => {
    if (!materiToDelete) return;

    try {
      const res = await fetch(`${FLASK_API}/materi/${materiToDelete.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal menghapus materi');
      }

      showToast('Materi berhasil dihapus!');
      setIsDeleteModalOpen(false);
      setMateriToDelete(null);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Gagal menghapus materi', 'error');
    }
  };

  // Handle Submit Subject
  const handleSubmitSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.title.trim()) {
      showToast('Nama kategori wajib diisi', 'error');
      return;
    }

    try {
      const url = editingSubject 
        ? `${FLASK_API}/subjects/${editingSubject.id}`
        : `${FLASK_API}/subjects`;
      
      const method = editingSubject ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subjectForm)
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Gagal menyimpan kategori');
      }

      showToast(editingSubject ? 'Kategori diperbarui!' : 'Kategori baru berhasil dibuat!');
      setSubjectForm({ title: '', icon: 'BookOpen', color: 'text-blue-600', bgColor: 'bg-blue-50', order: 0 });
      setEditingSubject(null);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan kategori', 'error');
    }
  };

  // Filtered Materi List
  const filteredMateri = materiList.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubjectFilter === 'all' || item.subjectId === parseInt(selectedSubjectFilter);
    const itemCareers = item.careers || ['Semua Karir'];
    const matchesCareer = selectedCareerFilter === 'all' || 
                          itemCareers.includes('Semua Karir') || 
                          itemCareers.includes(selectedCareerFilter);

    return matchesSearch && matchesSubject && matchesCareer;
  });

  // ─── RENDER: LOGIN GATE IF NOT AUTHENTICATED ────────────────────────────────
  if (!isAdminAuthenticated) {
    return (
      <div className="flex min-h-screen bg-slate-900 overflow-hidden w-full items-center justify-center p-4 font-sans relative">
        {/* Background glow & gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 sm:p-10 shadow-2xl max-w-md w-full relative z-10 text-left">
          
          <div className="flex items-center justify-between mb-8">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              Kembali ke Beranda
            </Link>
            <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[11px] font-bold tracking-wider uppercase">
              Admin Access
            </span>
          </div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30 text-white">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Dashboard Login</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Masukkan kredensial administrator untuk mengelola data materi silabus & database.
            </p>
          </div>

          {adminAuthError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0 text-red-400" />
              <span>{adminAuthError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Username Admin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserCheck size={18} />
                </div>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Username (contoh: iscLP)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password Admin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound size={18} />
                </div>
                <input
                  type={showAdminPass ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Password admin"
                  className="w-full pl-10 pr-11 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPass(!showAdminPass)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showAdminPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={adminAuthLoading}
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {adminAuthLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock size={16} />
                  <span>Buka Dashboard Admin</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-700/60 text-center">
            <p className="text-[11px] text-slate-500">
              Akses khusus instruktur & administrator Project ISC.
            </p>
          </div>

        </div>
      </div>
    );
  }

  // ─── RENDER: MAIN ADMIN DASHBOARD ──────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden w-full text-left font-sans">
      <Sidebar user={data.user} />

      <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
        
        {/* Toast Alert */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-semibold transition-all duration-300 transform translate-y-0 ${
            toast.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-700' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            {toast.type === 'error' ? <AlertCircle size={20} className="text-red-500" /> : <CheckCircle2 size={20} className="text-emerald-500" />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={14} /> Admin Portal
              </span>
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                ● Logged in as iscLP
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manajemen Data Materi</h1>
            <p className="text-gray-500 text-sm mt-1">Kelola silabus, video pembelajaran, dan artikel modul untuk siswa.</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsSubjectModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold text-sm shadow-sm transition-all hover:border-gray-300"
            >
              <FolderPlus size={18} className="text-indigo-600" />
              <span>Kelola Kategori ({subjects.length})</span>
            </button>

            <button
              onClick={handleOpenCreateMateri}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-sm shadow-indigo-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={18} />
              <span>Tambah Materi Baru</span>
            </button>

            <Link
              to="/materi"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all"
              title="Lihat tampilan di sisi siswa"
            >
              <Eye size={16} />
              <span>Preview Siswa</span>
            </Link>

            <button
              onClick={() => setIsAdminLogoutModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-sm transition-colors"
              title="Keluar dari mode admin"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Materi</p>
              <h3 className="text-2xl font-black text-gray-900">{stats.totalMateri || materiList.length}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layers size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Kategori / Subjek</p>
              <h3 className="text-2xl font-black text-gray-900">{stats.totalSubjects || subjects.length}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Award size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total XP Materi</p>
              <h3 className="text-2xl font-black text-gray-900">{materiList.reduce((acc, m) => acc + (m.xpReward || 50), 0)} XP</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Siswa Terdaftar</p>
              <h3 className="text-2xl font-black text-gray-900">{stats.totalUsers || 1}</h3>
            </div>
          </div>
        </div>

        {/* Toolbar: Search & Filter */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full lg:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari materi..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
            {/* Career Filter */}
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
              <Briefcase size={15} className="text-indigo-600" />
              <span>Karir:</span>
            </div>
            <select
              value={selectedCareerFilter}
              onChange={(e) => setSelectedCareerFilter(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="all">Semua Karir ({materiList.length})</option>
              {AVAILABLE_CAREERS.map(ac => (
                <option key={ac.id} value={ac.id}>
                  {ac.name}
                </option>
              ))}
            </select>

            {/* Subject Filter */}
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase ml-1">
              <Filter size={15} className="text-indigo-600" />
              <span>Kategori:</span>
            </div>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer max-w-[200px] truncate"
            >
              <option value="all">Semua Kategori ({materiList.length})</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.title} ({sub.modules?.length || 0})
                </option>
              ))}
            </select>

            <button
              onClick={fetchData}
              title="Refresh Data"
              className="p-2.5 bg-gray-50 border border-gray-200 text-gray-500 hover:text-indigo-600 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Materi Table List */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-10">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-lg">Daftar Modul Materi ({filteredMateri.length})</h2>
            <span className="text-xs text-gray-400">Menampilkan seluruh data dari database</span>
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center text-gray-400 gap-3">
              <RefreshCw size={32} className="animate-spin text-indigo-500" />
              <p className="text-sm font-medium">Memuat data materi...</p>
            </div>
          ) : filteredMateri.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center text-gray-400">
              <BookOpen size={48} className="text-gray-200 mb-3" />
              <h3 className="font-bold text-gray-700 text-lg mb-1">Belum Ada Materi Ditemukan</h3>
              <p className="text-sm text-gray-400 max-w-md mb-6">
                {searchQuery || selectedSubjectFilter !== 'all' || selectedCareerFilter !== 'all'
                  ? 'Tidak ada materi yang sesuai dengan pencarian atau filter yang dipilih.'
                  : 'Mulai dengan menambahkan materi pertama ke database untuk siswa.'}
              </p>
              <button
                onClick={handleOpenCreateMateri}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all"
              >
                + Tambah Materi Sekarang
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6">No / ID</th>
                    <th className="py-4 px-6">Kategori</th>
                    <th className="py-4 px-6">Target Karir</th>
                    <th className="py-4 px-6">Judul Materi & Deskripsi</th>
                    <th className="py-4 px-6">Tipe & Durasi</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredMateri.map((item) => {
                    const subject = subjects.find(s => s.id === item.subjectId);
                    const itemCareers = item.careers || ['Semua Karir'];
                    return (
                      <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="py-4 px-6 font-bold text-gray-400">
                          #{item.id}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/50">
                            {subject?.title || item.subjectTitle || 'Umum'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {itemCareers.map((c, i) => {
                              const meta = AVAILABLE_CAREERS.find(ac => ac.id === c);
                              const CareerIcon = meta?.Icon || Globe2;
                              return (
                                <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${meta ? meta.badgeClass : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                  <CareerIcon size={11} />
                                  <span>{c}</span>
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-4 px-6 max-w-md">
                          <div className="font-bold text-gray-900 text-base mb-1">{item.title}</div>
                          <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                            {item.description || 'Tidak ada deskripsi singkat.'}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700">
                              {item.type.includes('Video') ? <Video size={14} className="text-indigo-600" /> : <FileText size={14} className="text-emerald-600" />}
                              {item.type}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                              <Clock size={12} />
                              {item.duration} • <Sparkles size={12} className="text-amber-500" /> +{item.xpReward || 50} XP
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {item.isLocked ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Lock size={12} /> Terkunci
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Unlock size={12} /> Terbuka
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditMateri(item)}
                              title="Edit Materi"
                              className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                              <Edit3 size={17} />
                            </button>
                            <button
                              onClick={() => {
                                setMateriToDelete(item);
                                setIsDeleteModalOpen(true);
                              }}
                              title="Hapus Materi"
                              className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      {/* ─── MODAL: CREATE / EDIT MATERI ─────────────────────────────────── */}
      {isMateriModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingMateri ? 'Edit Data Materi' : 'Tambah Materi Baru'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Isi informasi materi dan tentukan pilihan rekomendasi karir tujuan.
                </p>
              </div>
              <button
                onClick={() => setIsMateriModalOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitMateri} className="p-8 overflow-y-auto space-y-5 flex-1 text-left">
              
              {/* Target Career Recommendation Multi-Selector */}
              <div className="bg-indigo-50/50 p-4.5 rounded-2xl border border-indigo-100/90">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase size={14} className="text-indigo-600" />
                    Pilihan Rekomendasi Karir (Target Career) *
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleCareerSelection('Semua Karir')}
                    className={`text-xs font-bold px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      (materiForm.careers || []).includes('Semua Karir')
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-100'
                    }`}
                  >
                    <Globe2 size={13} />
                    <span>Pilih Semua Karir (Umum)</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Tentukan materi ini ingin dimasukkan ke pilihan karir mana saja pada Learning Path siswa:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {AVAILABLE_CAREERS.map(c => {
                    const isAll = (materiForm.careers || []).includes('Semua Karir');
                    const isSpecific = (materiForm.careers || []).includes(c.id);
                    const isChecked = isAll || isSpecific;

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCareerSelection(c.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-left cursor-pointer ${
                          isSpecific
                            ? 'bg-white border-indigo-600 text-indigo-700 ring-2 ring-indigo-500/20 shadow-xs'
                            : isChecked
                            ? 'bg-indigo-100/70 border-indigo-300 text-indigo-900'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <c.Icon size={15} className="shrink-0" />
                        <span className="truncate flex-1">{c.name}</span>
                        {isChecked && (
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] ${isSpecific ? 'bg-indigo-600' : 'bg-indigo-400'}`}>
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject / Category & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Kategori / Subjek *
                  </label>
                  <select
                    value={materiForm.subjectId}
                    onChange={(e) => setMateriForm({ ...materiForm, subjectId: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                    required
                  >
                    {subjects.length === 0 && <option value="">Belum ada kategori</option>}
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Tipe Pembelajaran
                  </label>
                  <select
                    value={materiForm.type}
                    onChange={(e) => setMateriForm({ ...materiForm, type: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                  >
                    <option value="Video">Video</option>
                    <option value="Video + Artikel">Video + Artikel</option>
                    <option value="Artikel">Artikel / Bacaan</option>
                    <option value="Interaktif">Interaktif / Praktik</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Judul Materi *
                </label>
                <input
                  type="text"
                  value={materiForm.title}
                  onChange={(e) => setMateriForm({ ...materiForm, title: e.target.value })}
                  placeholder="Contoh: Operasi Dasar Perkalian Matriks"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Deskripsi Ringkas
                </label>
                <textarea
                  rows={2}
                  value={materiForm.description}
                  onChange={(e) => setMateriForm({ ...materiForm, description: e.target.value })}
                  placeholder="Penjelasan ringkas tentang apa yang akan dipelajari di modul ini..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              {/* Duration & Video URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Estimasi Durasi
                  </label>
                  <input
                    type="text"
                    value={materiForm.duration}
                    onChange={(e) => setMateriForm({ ...materiForm, duration: e.target.value })}
                    placeholder="Contoh: 18:20 atau 20 Menit"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    URL Video (YouTube / Direct Link)
                  </label>
                  <input
                    type="text"
                    value={materiForm.videoUrl}
                    onChange={(e) => setMateriForm({ ...materiForm, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Content / Article Body */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Konten Lengkap / Catatan Materi
                </label>
                <textarea
                  rows={5}
                  value={materiForm.content}
                  onChange={(e) => setMateriForm({ ...materiForm, content: e.target.value })}
                  placeholder="Tulis penjelasan lengkap, poin-poin rumus, atau ringkasan modul di sini..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all font-mono"
                />
              </div>

              {/* XP Reward & Locked Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Reward XP Siswa
                  </label>
                  <input
                    type="number"
                    value={materiForm.xpReward}
                    onChange={(e) => setMateriForm({ ...materiForm, xpReward: parseInt(e.target.value) || 0 })}
                    className="w-32 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isLocked"
                    checked={materiForm.isLocked}
                    onChange={(e) => setMateriForm({ ...materiForm, isLocked: e.target.checked })}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                  />
                  <label htmlFor="isLocked" className="text-sm font-bold text-gray-800 cursor-pointer">
                    Kunci materi secara default
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsMateriModalOpen(false)}
                  className="px-5 py-2.5 text-gray-500 hover:text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-sm shadow-indigo-200 transition-all"
                >
                  {editingMateri ? 'Simpan Perubahan' : 'Tambahkan ke Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: MANAGE SUBJECTS / CATEGORIES ───────────────────────────── */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Kelola Kategori / Subjek</h3>
                <p className="text-xs text-gray-500">Mata kuliah atau topik pembelajaran utama.</p>
              </div>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* List Existing Subjects */}
            <div className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-1">
              {subjects.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bgColor || 'bg-blue-50'} ${s.color || 'text-blue-600'}`}>
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{s.title}</h4>
                      <p className="text-xs text-gray-400">{s.modules?.length || 0} Modul</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (window.confirm(`Hapus kategori "${s.title}" beserta seluruh materinya?`)) {
                        await fetch(`${FLASK_API}/subjects/${s.id}`, { method: 'DELETE' });
                        showToast('Kategori berhasil dihapus!');
                        fetchData();
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Form Add Subject */}
            <form onSubmit={handleSubmitSubject} className="border-t border-gray-100 pt-5 space-y-4 text-left">
              <h4 className="text-sm font-bold text-gray-900">+ Buat Kategori Baru</h4>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  value={subjectForm.title}
                  onChange={(e) => setSubjectForm({ ...subjectForm, title: e.target.value })}
                  placeholder="Contoh: Kalkulus & Optimasi"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 text-gray-500 font-semibold text-sm hover:bg-gray-100 rounded-xl"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-sm"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: DELETE CONFIRMATION ──────────────────────────────────── */}
      {isDeleteModalOpen && materiToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-center border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Materi Ini?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Materi <span className="font-semibold text-gray-800">"{materiToDelete.title}"</span> akan dihapus secara permanen dari database.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-sm shadow-red-200 transition-colors"
              >
                Ya, Hapus Materi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Logout Modal */}
      <AdminLogoutModal 
        isOpen={isAdminLogoutModalOpen} 
        onClose={() => setIsAdminLogoutModalOpen(false)} 
        onLogout={handleAdminLogout}
      />

    </div>
  );
};

export default AdminDashboard;
