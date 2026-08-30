// Data default untuk akun baru (0 progres)
export const initialDashboardData = {
  user: {
    name: 'Siswa Baru',
    avatar: '', // URL gambar profil dari backend
    role: 'Siswa'
  },
  stats: [
    { id: 1, icon: "Book", value: "12", label: "Materi Tersedia", iconColorClass: "text-blue-500", iconBgClass: "bg-blue-50" },
    { id: 2, icon: "GraduationCap", value: "0", label: "Modul Selesai", iconColorClass: "text-emerald-500", iconBgClass: "bg-emerald-50" },
    { id: 3, icon: "Flame", value: "0", label: "Hari Beruntun", iconColorClass: "text-orange-500", iconBgClass: "bg-orange-50" },
    { id: 4, icon: "Trophy", value: "0", label: "Total XP", iconColorClass: "text-primary-dark", iconBgClass: "bg-primary-light/20" },
  ],
  activeCourse: {
    id: 101,
    title: 'Konsep Dasar Aljabar Linear',
    description: 'Ayo mulai pembelajaran visualmu untuk menguasai konsep matriks dasar!',
    progress: 0,
    tag: 'Mulai Belajar'
  },
  profileAnalysis: {
    learningStyle: {
      type: 'Belum Ditentukan',
      description: 'Lakukan lebih banyak kuis dan latihan agar sistem dapat menganalisis gaya belajarmu'
    },
    skills: [
      { name: 'Pemahaman Konsep', score: 0, colorClass: 'bg-primary-dark' },
      { name: 'Kecepatan Penyelesaian', score: 0, colorClass: 'bg-emerald-500' },
      { name: 'Akurasi Latihan Soal', score: 0, colorClass: 'bg-orange-500' },
    ]
  },
  recommendations: [
    { id: 201, title: "Visualisasi Graf dan Shortest Path", level: "Menengah", duration: "20", bgClass: "bg-pink-300", type: "Visual" },
    { id: 202, title: "Penerapan Teorema Bayes", level: "Lanjut", duration: "35", bgClass: "bg-indigo-300", type: "Visual" }
  ],
  dailyTarget: {
    currentMinutes: 0,
    targetMinutes: 60,
    message: 'Ayo mulai target belajarmu hari ini!'
  }
};
