import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ArrowRight, 
  MonitorPlay, 
  Headphones, 
  BookOpen, 
  MousePointer2,
  Calculator,
  FlaskConical,
  Globe,
  Book,
  Star,
  Sparkles
} from 'lucide-react';

const FLASK_API = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000/api';
const LARAVEL_API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const assessmentData = [
  {
    step: 1,
    title: 'Saat belajar hal baru, kamu paling nyaman dengan cara...',
    options: [
      {
        id: 'visual',
        title: 'Menonton Video Animasi',
        description: 'Video penjelasan visual dengan animasi yang menarik dan ilustrasi konsep.',
        icon: MonitorPlay,
        iconBg: 'bg-teal-100',
        iconColor: 'text-teal-600',
        tag: 'Visual',
        tagBg: 'bg-teal-100',
        tagColor: 'text-teal-700',
      },
      {
        id: 'auditory',
        title: 'Mendengarkan Penjelasan',
        description: 'Penjelasan lisan, diskusi kelompok, atau podcast yang informatif.',
        icon: Headphones,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        tag: 'Auditori',
        tagBg: 'bg-orange-100',
        tagColor: 'text-orange-700',
      },
      {
        id: 'read_write',
        title: 'Membaca & Mencatat',
        description: 'Membaca ringkasan materi, mencatat poin penting, dan membuat diagram.',
        icon: BookOpen,
        iconBg: 'bg-pink-100',
        iconColor: 'text-pink-600',
        tag: 'Baca-Tulis',
        tagBg: 'bg-pink-100',
        tagColor: 'text-pink-700',
      },
      {
        id: 'kinesthetic',
        title: 'Langsung Mencoba',
        description: 'Simulasi interaktif, latihan langsung, dan praktik nyata dari teori.',
        icon: MousePointer2,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        tag: 'Kinestetik',
        tagBg: 'bg-red-100',
        tagColor: 'text-red-700',
      }
    ]
  },
  {
    step: 2,
    title: 'Mata pelajaran apa yang paling kamu sukai?',
    options: [
      {
        id: 'math',
        title: 'Matematika',
        description: 'Memecahkan soal logika dan perhitungan',
        icon: Calculator,
        iconBg: 'bg-teal-100',
        iconColor: 'text-teal-600',
        tag: 'Numerik & Logika',
        tagBg: 'bg-teal-100',
        tagColor: 'text-teal-700',
      },
      {
        id: 'science',
        title: 'Ilmu Pengetahuan Alam',
        description: 'Eksperimen, observasi, dan fenomena alam yang menakjubkan.',
        icon: FlaskConical,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        tag: 'Sains',
        tagBg: 'bg-orange-100',
        tagColor: 'text-orange-700',
      },
      {
        id: 'social',
        title: 'Ilmu Pengetahuan Sosial',
        description: 'Sejarah, geografi, ekonomi, dan dinamika masyarakat.',
        icon: Globe,
        iconBg: 'bg-pink-100',
        iconColor: 'text-pink-600',
        tag: 'Sosial',
        tagBg: 'bg-pink-100',
        tagColor: 'text-pink-700',
      },
      {
        id: 'language',
        title: 'Bahasa Indonesia',
        description: 'Membaca, menulis, dan memahami sastra serta tata bahasa.',
        icon: Book,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        tag: 'Literasi',
        tagBg: 'bg-red-100',
        tagColor: 'text-red-700',
      }
    ]
  },
  {
    step: 3,
    title: 'Tingkat Kemampuan',
    options: [
      {
        id: 'beginner',
        title: 'Pemula',
        description: 'Saya masih membutuhkan banyak penjelasan.',
        icon: Star,
        iconBg: 'bg-teal-100',
        iconColor: 'text-teal-600',
        tag: '★',
        tagBg: 'bg-teal-100',
        tagColor: 'text-teal-700',
      },
      {
        id: 'intermediate',
        title: 'Menengah',
        description: 'Saya sudah memahami dasar-dasarnya.',
        icon: Star,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        tag: '★★',
        tagBg: 'bg-orange-100',
        tagColor: 'text-orange-700',
      },
      {
        id: 'advanced',
        title: 'Mahir',
        description: 'Saya ingin materi yang lebih menantang.',
        icon: Star,
        iconBg: 'bg-pink-100',
        iconColor: 'text-pink-600',
        tag: '★★★',
        tagBg: 'bg-pink-100',
        tagColor: 'text-pink-700',
      }
    ]
  },
  {
    step: 4,
    title: 'Target Belajar',
    options: [
      {
        id: 'exam',
        title: 'Persiapan Ujian',
        description: 'Memecahkan soal logika dan perhitungan',
        icon: Calculator,
        iconBg: 'bg-teal-100',
        iconColor: 'text-teal-600',
        tag: 'Numerik & Logika',
        tagBg: 'bg-teal-100',
        tagColor: 'text-teal-700',
      },
      {
        id: 'skill',
        title: 'Belajar Skill Baru',
        description: 'Eksperimen, observasi, dan fenomena alam yang menakjubkan.',
        icon: FlaskConical,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        tag: 'Sains',
        tagBg: 'bg-orange-100',
        tagColor: 'text-orange-700',
      },
      {
        id: 'score',
        title: 'Meningkatkan Nilai',
        description: 'Sejarah, geografi, ekonomi, dan dinamika masyarakat.',
        icon: Globe,
        iconBg: 'bg-pink-100',
        iconColor: 'text-pink-600',
        tag: 'Sosial',
        tagBg: 'bg-pink-100',
        tagColor: 'text-pink-700',
      },
      {
        id: 'olympiad',
        title: 'Persiapan Olimpiade',
        description: 'Membaca, menulis, dan memahami sastra serta tata bahasa.',
        icon: Book,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        tag: 'Literasi',
        tagBg: 'bg-red-100',
        tagColor: 'text-red-700',
      }
    ]
  }
];

import { useAuth } from '../context/AuthContext';

const Assessment = () => {
  const navigate = useNavigate();
  const { dashboardData: data, setDashboardData } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({});

  const currentData = assessmentData[currentStep - 1];
  const progressPercentage = (currentStep / 4) * 100;

  const handleSelect = (optionId) => {
    setAnswers({ ...answers, [currentStep]: optionId });
  };

 const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // 1. Ambil ID jawaban yang diklik user pada setiap Step
      const step1_gayaBelajar = answers[1] || 'visual';
      const step2_mataPelajaran = answers[2] || 'math';
      const step3_level = answers[3] || 'beginner';
      const step4_target = answers[4] || 'exam';

      // 2. Ubah ID menjadi Teks Terbaca (supaya di MySQL tulisannya bagus)
      const mapGayaBelajar = {
        visual: 'Visual (Video/Animasi)',
        auditory: 'Auditori (Penjelasan/Podcast)',
        read_write: 'Baca-Tulis (Catatan/Ringkasan)',
        kinesthetic: 'Kinestetik (Praktik/Latihan)'
      };

      const mapMataPelajaran = {
        math: 'Matematika',
        science: 'IPA / Sains',
        social: 'IPS / Sosial',
        language: 'Bahasa Indonesia'
      };

      const mapLevel = {
        beginner: 'Pemula',
        intermediate: 'Menengah',
        advanced: 'Mahir'
      };

      const savedUserId = localStorage.getItem('user_id') || 1;

      // 3. Kirim MURNI HASIL PILIHAN USER ke Laravel
      try {
        const response = await fetch(`${LARAVEL_API}/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            user_id: savedUserId,
            jurusan: mapMataPelajaran[step2_mataPelajaran], // Hasil Pilihan Step 2
            semester: 4,
            peminatan: mapGayaBelajar[step1_gayaBelajar],   // Hasil Pilihan Step 1
            level_kemampuan: mapLevel[step3_level]          // Hasil Pilihan Step 3
          })
        });

        const result = await response.json();
        console.log('Data kuesioner user berhasil tersimpan:', result);
      } catch (error) {
        console.error('Gagal mengirim ke Laravel:', error);
      }

      const newData = JSON.parse(JSON.stringify(data));
      if (!newData.preferences) newData.preferences = {};
      newData.preferences.learningStyle = step1_gayaBelajar;
      
      setDashboardData(newData);
      navigate('/dashboard');
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex justify-center py-10 px-4 font-sans text-gray-900">
      <div className="w-full max-w-5xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 bg-indigo-100 text-[#4232c2] px-4 py-2 rounded-full text-sm font-semibold">
            <Sparkles size={16} />
            <span>Gaya Belajar</span>
          </div>
          <div className="text-sm font-semibold text-gray-500">
            Pertanyaan {currentStep} dari 4 <span className="text-[#4232c2] ml-2">{progressPercentage}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-12">
          {[1, 2, 3, 4].map((step) => (
            <div 
              key={step} 
              className={`h-2 rounded-full flex-1 ${
                step <= currentStep ? 'bg-[#4232c2]' : 'bg-indigo-100'
              }`}
            />
          ))}
        </div>

        {/* Question Area */}
        <div className="flex items-start gap-4 mb-8">
          <button 
            onClick={handleBack}
            className="mt-1 text-[#4232c2] hover:text-[#3426a1] transition-colors"
          >
            <ChevronLeft size={32} />
          </button>
          <div>
            <h3 className="text-xs font-bold text-[#4232c2] uppercase tracking-wider mb-2">
              PILIH SATU JAWABAN TERBAIK
            </h3>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentData.title}
            </h1>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-0 md:ml-12 mb-12">
          {currentData.options.map((option) => {
            const isSelected = answers[currentStep] === option.id;
            return (
              <div
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={`bg-white p-6 rounded-3xl cursor-pointer border-2 transition-all duration-200 ${
                  isSelected ? 'border-[#4232c2] shadow-md' : 'border-transparent shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${option.iconBg} ${option.iconColor}`}>
                    <option.icon size={24} />
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-[#4232c2] bg-[#4232c2]' : 'border-gray-200'
                  }`}>
                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2 text-gray-800">{option.title}</h3>
                <p className="text-gray-400 font-medium text-sm mb-6 leading-relaxed min-h-[3rem]">
                  {option.description}
                </p>
                
                <div className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold ${option.tagBg} ${option.tagColor}`}>
                  {option.tag}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-12">
          <button
            onClick={handleNext}
            disabled={!answers[currentStep]}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold transition-all shadow-md ${
              answers[currentStep] 
                ? 'bg-[#4232c2] hover:bg-[#3426a1] text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Lanjut <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Assessment;