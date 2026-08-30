import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import BottomSheetSelector from '../components/BottomSheetSelector';
import { Sparkles, Plus, X, AlertCircle, ChevronRight, Briefcase, ChevronRightSquare } from 'lucide-react';

const FLASK_API = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000/api';

export default function Rekomendasi() {
  const { user, dashboardData, setHasRecommendation } = useAuth();
  
  // Data states
  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableInterests, setAvailableInterests] = useState([]);
  
  // Selection states
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  
  // UI states
  const [isSkillsSheetOpen, setIsSkillsSheetOpen] = useState(false);
  const [isInterestsSheetOpen, setIsInterestsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Result state
  const [predictionResult, setPredictionResult] = useState(null);

  // Fetch available items & existing recommendation on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, interestsRes] = await Promise.all([
          fetch(`${FLASK_API}/skills`),
          fetch(`${FLASK_API}/interests`)
        ]);
        
        if (skillsRes.ok) {
          const skillsData = await skillsRes.json();
          setAvailableSkills(skillsData.skills || []);
        }
        
        if (interestsRes.ok) {
          const interestsData = await interestsRes.json();
          setAvailableInterests(interestsData.interests || []);
        }
      } catch (err) {
        console.error("Failed to fetch available data", err);
        setAvailableSkills(["Python", "JavaScript", "React", "Data Analysis", "Machine Learning", "UI/UX", "SQL", "DevOps"]);
        setAvailableInterests(["Web Development", "Artificial Intelligence", "Data Science", "Design", "Cybersecurity", "Cloud Computing"]);
      }

      // Check if user has an existing saved recommendation
      const activeUserId = user?.id || localStorage.getItem('user_id');
      if (activeUserId) {
        try {
          const recRes = await fetch(`${FLASK_API}/recommendation/${activeUserId}`);
          if (recRes.ok) {
            const recJson = await recRes.json();
            if (recJson.recommendation) {
              const rec = recJson.recommendation;
              if (rec.skills && rec.skills.length > 0) setSelectedSkills(rec.skills);
              if (rec.interests && rec.interests.length > 0) setSelectedInterests(rec.interests);
              setPredictionResult({
                prediction: rec.top_career,
                probabilities: rec.probabilities || {}
              });
            }
          }
        } catch (_) {}
      }
    };
    fetchData();
  }, [user]);

  const totalSelected = selectedSkills.length + selectedInterests.length;
  const isSubmitReady = totalSelected >= 3;

  const removeSkill = (skill) => {
    setSelectedSkills(prev => prev.filter(s => s !== skill));
  };

  const removeInterest = (interest) => {
    setSelectedInterests(prev => prev.filter(i => i !== interest));
  };

  const handlePredict = async () => {
    if (!isSubmitReady) return;
    
    setIsLoading(true);
    setError(null);
    setPredictionResult(null);
    
    try {
      const response = await fetch(`${FLASK_API}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: selectedSkills,
          interests: selectedInterests
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendation. Please try again later.');
      }

      const data = await response.json();
      setPredictionResult(data);

      // Auto-save recommendation to database
      const activeUserId = user?.id || localStorage.getItem('user_id');
      if (activeUserId) {
        try {
          await fetch(`${FLASK_API}/save-recommendation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: parseInt(activeUserId),
              top_career: data.prediction,
              skills: selectedSkills,
              interests: selectedInterests,
              probabilities: data.probabilities
            })
          });
        } catch (_) {}
      }
      localStorage.setItem('has_recommendation', 'true');
      localStorage.setItem('career_recommendation', JSON.stringify({
        top_career: data.prediction,
        skills: selectedSkills,
        interests: selectedInterests,
        probabilities: data.probabilities,
        saved_at: new Date().toISOString()
      }));
      if (setHasRecommendation) setHasRecommendation(true);
    } catch (err) {
      setError(err.message || 'Unable to connect to the recommendation engine.');
    } finally {
      setIsLoading(false);
    }
  };

  const careerDescriptions = {
    "Data & AI": "Menganalisis data dan membangun model kecerdasan buatan",
    "Design": "Merancang antarmuka dan pengalaman pengguna yang menarik",
    "Infrastructure & Security": "Mengelola infrastruktur IT dan keamanan sistem",
    "Product & Business": "Mengelola produk digital dan strategi bisnis",
    "Software Development": "Membangun dan mengembangkan aplikasi perangkat lunak"
  };

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden">
      {/* Sidebar - Using the provided user object structure */}
      <Sidebar user={user || dashboardData?.user} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pt-20 md:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10 pb-28 md:pb-10">
          
          {/* Header */}
          <div className="mb-6 md:mb-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              Rekomendasi Karir AI
              <div className="bg-indigo-100 p-2 rounded-xl">
                <Sparkles className="text-indigo-600" size={24} />
              </div>
            </h1>
            <p className="text-gray-500 mt-2 text-sm sm:text-base font-medium">
              Temukan jalur karir yang cocok berdasarkan keahlian dan minat kamu
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Skills Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Keahlian</h2>
                  <p className="text-sm font-medium text-gray-500">Pilih keahlian yang kamu miliki</p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedSkills.map(skill => (
                    <div key={skill} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-indigo-100 animate-in fade-in zoom-in duration-200">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => setIsSkillsSheetOpen(true)}
                  className="w-full py-3 flex items-center justify-center gap-2 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100/50 border border-dashed border-indigo-200 rounded-xl font-semibold transition-colors"
                >
                  <Plus size={18} />
                  Tambahkan Keahlian
                </button>
              </div>

              {/* Interests Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Minat</h2>
                  <p className="text-sm font-medium text-gray-500">Apa yang kamu minati?</p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedInterests.map(interest => (
                    <div key={interest} className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-purple-100 animate-in fade-in zoom-in duration-200">
                      {interest}
                      <button onClick={() => removeInterest(interest)} className="hover:bg-purple-200 rounded-full p-0.5 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => setIsInterestsSheetOpen(true)}
                  className="w-full py-3 flex items-center justify-center gap-2 text-purple-600 bg-purple-50/50 hover:bg-purple-100/50 border border-dashed border-purple-200 rounded-xl font-medium transition-colors"
                >
                  <Plus size={18} />
                  Tambahkan Minat
                </button>
              </div>

              {/* Validation & Submit */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="text-sm font-medium text-gray-700">
                    {totalSelected} item dipilih
                  </span>
                  {!isSubmitReady && (
                    <span className="text-xs text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md">
                      <AlertCircle size={12} />
                      Pilih minimal {3 - totalSelected} lagi
                    </span>
                  )}
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl flex gap-3 text-sm border border-red-100">
                    <AlertCircle className="shrink-0" size={18} />
                    {error}
                  </div>
                )}

                <button
                  onClick={handlePredict}
                  disabled={!isSubmitReady || isLoading}
                  className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-lg transition-all duration-300 shadow-sm
                    ${!isSubmitReady 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md hover:shadow-indigo-200'
                    }`}
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Dapatkan Rekomendasi
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-7">
              {predictionResult ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-700 fill-mode-both">
                  
                  {/* Top Prediction Card */}
                  <div className="bg-gradient-to-br from-[#4232c2] to-[#6366f1] rounded-3xl p-8 text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-700"></div>
                    <div className="relative z-10">
                      <p className="text-indigo-100 font-medium mb-2 flex items-center gap-2">
                        <Briefcase size={18} />
                        Jalur Karir Terbaik Untukmu
                      </p>
                      <h2 className="text-4xl font-bold mb-4 tracking-tight">
                        {predictionResult.prediction}
                      </h2>
                      <p className="text-indigo-100/90 text-sm leading-relaxed max-w-md">
                        {careerDescriptions[predictionResult.prediction] || "Jalur karir yang paling sesuai dengan profil keahlian dan minat yang kamu miliki saat ini."}
                      </p>
                    </div>
                  </div>

                  {/* Other Probabilities */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/50">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 px-2">Analisis Kecocokan</h3>
                    
                    <div className="space-y-5">
                      {Object.entries(predictionResult.probabilities)
                        .sort(([,a], [,b]) => b - a)
                        .map(([career, prob], idx) => {
                          const percentage = Math.round(prob * 100);
                          const isTop = idx === 0;
                          
                          return (
                            <div key={career} className="group px-2">
                              <div className="flex justify-between items-end mb-2">
                                <div>
                                  <h4 className={`font-semibold ${isTop ? 'text-indigo-700' : 'text-gray-700'}`}>
                                    {career}
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                    {careerDescriptions[career]}
                                  </p>
                                </div>
                                <span className={`font-bold ${isTop ? 'text-indigo-600' : 'text-gray-600'}`}>
                                  {percentage}%
                                </span>
                              </div>
                              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ease-out delay-${idx * 100}
                                    ${isTop ? 'bg-[#4232c2]' : 
                                      idx === 1 ? 'bg-indigo-400' :
                                      idx === 2 ? 'bg-indigo-300' : 'bg-gray-300'}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              ) : (
                // Empty state / Placeholder
                <div className="h-full min-h-[400px] border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-gray-50/50">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-300">
                    <Sparkles size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-400 mb-2">Belum ada rekomendasi</h3>
                  <p className="text-gray-400 max-w-sm">
                    Pilih minimal 3 keahlian atau minat di panel sebelah kiri untuk melihat rekomendasi jalur karir yang cocok untukmu.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selectors */}
      <BottomSheetSelector
        isOpen={isSkillsSheetOpen}
        onClose={() => setIsSkillsSheetOpen(false)}
        title="Tambahkan Keahlian"
        items={availableSkills}
        selectedItems={selectedSkills}
        onConfirm={setSelectedSkills}
      />
      
      <BottomSheetSelector
        isOpen={isInterestsSheetOpen}
        onClose={() => setIsInterestsSheetOpen(false)}
        title="Tambahkan Minat"
        items={availableInterests}
        selectedItems={selectedInterests}
        onConfirm={setSelectedInterests}
      />
    </div>
  );
}
