import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const Quiz = () => {
  const navigate = useNavigate();
  const { dashboardData: data, setDashboardData } = useAuth();
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      id: 1,
      question: "Nilai dari sin 30° adalah...",
      options: [
        { id: 'A', text: '1/2' },
        { id: 'B', text: '1/3' },
        { id: 'C', text: '√3/2' },
        { id: 'D', text: '1' }
      ],
      correct: 'A',
      hint: "Ingat kembali nilai perbandingan trigonometri sudut istimewa pada segitiga siku-siku."
    },
    {
      id: 2,
      question: "Jika cos θ = 3/5 dan θ di kuadran I, maka nilai sin θ adalah...",
      options: [
        { id: 'A', text: '2/5' },
        { id: 'B', text: '4/5' },
        { id: 'C', text: '1' },
        { id: 'D', text: '3/4' }
      ],
      correct: 'B',
      hint: "Gunakan identitas trigonometri sin²θ + cos²θ = 1 atau teorema Pythagoras (segitiga 3-4-5)."
    },
    {
      id: 3,
      question: "Nilai dari tan 45° + sin 90° adalah...",
      options: [
        { id: 'A', text: '0' },
        { id: 'B', text: '1' },
        { id: 'C', text: '2' },
        { id: 'D', text: '√2' }
      ],
      correct: 'C',
      hint: "Kedua sudut tersebut menghasilkan nilai 1. Jumlahkan keduanya."
    },
    {
      id: 4,
      question: "Sudut 135° terletak pada kuadran ke-...",
      options: [
        { id: 'A', text: 'I' },
        { id: 'B', text: 'II' },
        { id: 'C', text: 'III' },
        { id: 'D', text: 'IV' }
      ],
      correct: 'B',
      hint: "Kuadran II mencakup sudut antara 90° hingga 180°."
    },
    {
      id: 5,
      question: "Bentuk sederhana dari (sin x)(csc x) adalah...",
      options: [
        { id: 'A', text: '0' },
        { id: 'B', text: '1' },
        { id: 'C', text: 'sin² x' },
        { id: 'D', text: 'cos x' }
      ],
      correct: 'B',
      hint: "Cosecan (csc) adalah kebalikan dari sinus."
    },
    {
      id: 6,
      question: "Dalam segitiga siku-siku, perbandingan sisi depan dengan sisi miring disebut...",
      options: [
        { id: 'A', text: 'Sinus' },
        { id: 'B', text: 'Cosinus' },
        { id: 'C', text: 'Tangen' },
        { id: 'D', text: 'Secan' }
      ],
      correct: 'A',
      hint: "Ingat singkatan De-Mi (Depan Miring) untuk fungsi ini."
    },
    {
      id: 7,
      question: "Konversi sudut π/3 radian ke dalam derajat adalah...",
      options: [
        { id: 'A', text: '30°' },
        { id: 'B', text: '45°' },
        { id: 'C', text: '60°' },
        { id: 'D', text: '90°' }
      ],
      correct: 'C',
      hint: "Gunakan rumus: Derajat = Radian × (180/π)."
    },
    {
      id: 8,
      question: "Periode dari fungsi f(x) = sin(x) adalah...",
      options: [
        { id: 'A', text: '90°' },
        { id: 'B', text: '180°' },
        { id: 'C', text: '270°' },
        { id: 'D', text: '360°' }
      ],
      correct: 'D',
      hint: "Fungsi sinus akan mengulangi polanya setiap satu putaran penuh lingkaran."
    },
    {
      id: 9,
      question: "Nilai dari cos 120° adalah...",
      options: [
        { id: 'A', text: '-1/2' },
        { id: 'B', text: '1/2' },
        { id: 'C', text: '-√3/2' },
        { id: 'D', text: '√3/2' }
      ],
      correct: 'A',
      hint: "Gunakan rumus sudut berelasi di kuadran II: cos(180° - 60°)."
    },
    {
      id: 10,
      question: "Jika tan α = 1 dan α di kuadran III, nilai sin α adalah...",
      options: [
        { id: 'A', text: '1/√2' },
        { id: 'B', text: '-1/√2' },
        { id: 'C', text: '1/2' },
        { id: 'D', text: '-1/2' }
      ],
      correct: 'B',
      hint: "Di kuadran III, nilai sinus dan cosinus adalah negatif."
    }
  ];

  const currentQuestion = questions[currentIdx];
  const progressPercent = ((currentIdx) / questions.length) * 100;

  const handleOptionSelect = (optionId) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionId
    });
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    } else {
      navigate('/latihan');
    }
  };

  const finishQuiz = () => {
    let finalScore = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct) {
        finalScore += 10; // 10 points per correct answer
      }
    });
    setScore(finalScore);
    setIsFinished(true);

    // Save to dashboardData
    const newData = JSON.parse(JSON.stringify(data));
    if (!newData.completedQuizzes) {
      newData.completedQuizzes = [];
    }
    // Record quiz completion (we'll just use a mock quiz id "trigonometri-1")
    if (!newData.completedQuizzes.includes("trig-1")) {
      newData.completedQuizzes.push("trig-1");
      // Add XP points (10 XP per point = max 1000)
      newData.quizXp = (newData.quizXp || 0) + (finalScore * 10);
      
      // Add study time (20 minutes for a quiz)
      if (!newData.dailyTarget) newData.dailyTarget = { targetMinutes: 30, currentMinutes: 0 };
      newData.dailyTarget.currentMinutes = (newData.dailyTarget.currentMinutes || 0) + 20;

      // Add Notification
      if (!newData.notifications) newData.notifications = [];
      newData.notifications.unshift({
        id: Date.now() + Math.random(),
        type: 'quiz',
        unread: true,
        title: 'Hasil Kuis: Latihan Dasar',
        time: 'Baru saja',
        description: `Kamu mendapatkan skor **${finalScore}** dan memperoleh **+${finalScore * 10} XP**! Terus semangat!`,
        iconName: 'ClipboardList',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
      });
    }
    setDashboardData(newData);
  };

  const currentPoints = Object.keys(answers).length * 100; // Simulated points as user answers

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full text-left">
      <Sidebar user={data?.user} />
      
      <main className="flex-1 overflow-y-auto pt-20 md:pt-8 pb-24 md:pb-10 px-4 sm:px-6 md:px-8 lg:p-10">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Latihan Soal</h1>
          <p className="text-gray-500 font-medium text-sm">Trigonometri Dasar • 10 Soal • Adaptive Quiz</p>
        </div>

        {isFinished ? (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-50 text-center max-w-3xl mx-auto">
            <div className="w-24 h-24 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Selesai!</h2>
            <p className="text-gray-500 mb-8">Kamu telah menyelesaikan quiz Trigonometri Dasar.</p>
            
            <div className="flex justify-center gap-8 mb-10">
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-400 uppercase mb-1">Skor Kamu</p>
                <p className="text-4xl font-black text-[#4232c2]">{score}/100</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-400 uppercase mb-1">XP Didapat</p>
                <p className="text-4xl font-black text-orange-500">+{score * 10}</p>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/latihan')}
              className="px-8 py-3 bg-[#4232c2] hover:bg-[#3426a1] text-white font-bold rounded-xl transition-colors shadow-sm"
            >
              Kembali ke Latihan Soal
            </button>
          </div>
        ) : (
          <>
            {/* Top Bar (Progress & Timer) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex-1 max-w-3xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-900 text-sm">Progress Quiz ({currentIdx + 1}/10)</span>
                </div>
                <div className="h-2 w-full bg-indigo-50 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4232c2] rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>
              
              <div className="bg-orange-100 text-orange-600 rounded-xl px-5 py-3.5 flex items-center gap-2 font-bold shadow-sm shrink-0">
                <Clock size={18} />
                <span>08:24</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column (Question Card) */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50 flex flex-col h-full">
                  <div className="mb-6">
                    <span className="text-sm font-semibold text-gray-500">Soal {currentIdx + 1}</span>
                    <h2 className="text-2xl font-bold text-gray-900 mt-2">{currentQuestion.question}</h2>
                  </div>
                  
                  <div className="space-y-4 mb-10 flex-1">
                    {currentQuestion.options.map((option) => (
                      <div 
                        key={option.id}
                        onClick={() => handleOptionSelect(option.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                          answers[currentQuestion.id] === option.id 
                            ? 'border-[#4232c2] bg-indigo-50/50 shadow-sm' 
                            : 'border-gray-100 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-medium text-gray-700">{option.id}. {option.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center pt-6 border-t border-gray-50 mt-auto">
                    <button 
                      onClick={handlePrev}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-sm"
                    >
                      Sebelumnya
                    </button>
                    <button 
                      onClick={handleNext}
                      disabled={!answers[currentQuestion.id]}
                      className={`px-6 py-3 font-bold rounded-xl transition-colors text-sm ${
                        answers[currentQuestion.id] ? 'bg-[#4232c2] hover:bg-[#3426a1] text-white shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {currentIdx === questions.length - 1 ? 'Selesaikan Quiz' : 'Selanjutnya'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column (Sidebar Cards) */}
              <div className="space-y-6">
                
                {/* AI Hint */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
                  <h3 className="font-bold text-gray-900 mb-4">AI Hint</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    {currentQuestion.hint}
                  </p>
                  <div className="inline-flex px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold">
                    Adaptive Help
                  </div>
                </div>

                {/* Total Poin */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex flex-col justify-center min-h-[140px]">
                  <h3 className="font-bold text-gray-900 mb-2">Total Poin Sementara</h3>
                  <p className="text-4xl font-black text-gray-900">{currentPoints}</p>
                </div>

              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Quiz;
