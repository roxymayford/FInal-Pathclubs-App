import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Plus, X, AlertCircle, Briefcase,
  ChevronRight, SkipForward, CheckCircle2, ArrowRight,
  Zap, Star, Target,
  Bot, Code2, Palette, ShieldCheck, BarChart3, Globe2, Lightbulb, TrendingUp
} from 'lucide-react';
import BottomSheetSelector from '../components/BottomSheetSelector';

const FLASK_API = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000/api';

const careerMeta = {
  'Data & AI':                { Icon: Bot,         color: 'from-blue-500 to-cyan-500',    bg: 'bg-blue-50',  text: 'text-blue-700',  desc: 'Menganalisis data & membangun model kecerdasan buatan' },
  'Design':                   { Icon: Palette,      color: 'from-pink-500 to-rose-500',    bg: 'bg-pink-50',  text: 'text-pink-700',  desc: 'Merancang antarmuka & pengalaman pengguna yang menarik' },
  'Infrastructure & Security':{ Icon: ShieldCheck,  color: 'from-orange-500 to-amber-500', bg: 'bg-orange-50',text: 'text-orange-700', desc: 'Mengelola infrastruktur IT & keamanan sistem' },
  'Product & Business':       { Icon: BarChart3,    color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50',text:'text-emerald-700', desc: 'Mengelola produk digital & strategi bisnis' },
  'Software Development':     { Icon: Code2,        color: 'from-violet-500 to-purple-600',bg: 'bg-violet-50',text: 'text-violet-700', desc: 'Membangun & mengembangkan aplikasi perangkat lunak' },
};

const STEPS = ['select', 'result'];

export default function CareerOnboarding() {
  const navigate = useNavigate();
  const userId   = localStorage.getItem('user_id');

  // Skills & Interests data
  const [availableSkills,    setAvailableSkills]    = useState([]);
  const [availableInterests, setAvailableInterests] = useState([]);
  const [selectedSkills,     setSelectedSkills]     = useState([]);
  const [selectedInterests,  setSelectedInterests]  = useState([]);

  // UI states
  const [step,                 setStep]                 = useState('select'); // 'select' | 'result'
  const [isSkillsOpen,         setIsSkillsOpen]         = useState(false);
  const [isInterestsOpen,      setIsInterestsOpen]      = useState(false);
  const [isLoading,            setIsLoading]            = useState(false);
  const [isSaving,             setIsSaving]             = useState(false);
  const [error,                setError]                = useState(null);
  const [predictionResult,     setPredictionResult]     = useState(null);
  const [saveSuccess,          setSaveSuccess]          = useState(false);
  const [animateResult,        setAnimateResult]        = useState(false);

  // Fetch skills & interests on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, interestsRes] = await Promise.all([
          fetch(`${FLASK_API}/skills`),
          fetch(`${FLASK_API}/interests`),
        ]);
        if (skillsRes.ok) {
          const d = await skillsRes.json();
          setAvailableSkills(d.skills || []);
        }
        if (interestsRes.ok) {
          const d = await interestsRes.json();
          setAvailableInterests(d.interests || []);
        }
      } catch (_) {
        // Fallback data
        setAvailableSkills(['Python', 'JavaScript', 'React', 'Data Analysis', 'Machine Learning', 'UI/UX Design', 'SQL', 'DevOps', 'Node.js', 'Java']);
        setAvailableInterests(['Web Development', 'Artificial Intelligence', 'Data Science', 'UI/UX Design', 'Cybersecurity', 'Cloud Computing', 'Mobile Development', 'Game Development']);
      }
    };
    fetchData();
  }, []);

  const totalSelected  = selectedSkills.length + selectedInterests.length;
  const isSubmitReady  = totalSelected >= 3;

  const removeSkill    = (s) => setSelectedSkills(prev => prev.filter(x => x !== s));
  const removeInterest = (i) => setSelectedInterests(prev => prev.filter(x => x !== i));

  // ─── Get Recommendation ──────────────────────────────────────────────────
  const handlePredict = async () => {
    if (!isSubmitReady) return;
    setIsLoading(true);
    setError(null);
    setPredictionResult(null);

    try {
      const res = await fetch(`${FLASK_API}/predict`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ skills: selectedSkills, interests: selectedInterests }),
      });

      if (!res.ok) throw new Error('Gagal mendapat rekomendasi');
      const data = await res.json();
      setPredictionResult(data);
      setStep('result');
      setTimeout(() => setAnimateResult(true), 100);
    } catch (err) {
      // Mock fallback for development
      const mockResult = {
        prediction: 'Software Development',
        probabilities: {
          'Software Development':    0.62,
          'Data & AI':               0.18,
          'Design':                  0.09,
          'Infrastructure & Security': 0.07,
          'Product & Business':      0.04,
        },
      };
      setPredictionResult(mockResult);
      setStep('result');
      setTimeout(() => setAnimateResult(true), 100);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Save Recommendation ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!predictionResult) return;
    setIsSaving(true);

    try {
      await fetch(`${FLASK_API}/save-recommendation`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          user_id:       userId ? parseInt(userId) : null,
          top_career:    predictionResult.prediction,
          skills:        selectedSkills,
          interests:     selectedInterests,
          probabilities: predictionResult.probabilities,
        }),
      });
    } catch (_) {
      // Save to localStorage as fallback
      localStorage.setItem('career_recommendation', JSON.stringify({
        top_career:    predictionResult.prediction,
        skills:        selectedSkills,
        interests:     selectedInterests,
        probabilities: predictionResult.probabilities,
        saved_at:      new Date().toISOString(),
      }));
    }

    setSaveSuccess(true);
    setTimeout(() => navigate('/dashboard'), 1400);
  };

  // ─── Skip ────────────────────────────────────────────────────────────────
  const handleSkip = () => navigate('/dashboard');

  const meta = predictionResult ? (careerMeta[predictionResult.prediction] || careerMeta['Software Development']) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7ff] via-white to-[#eef2ff] flex flex-col">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-6 py-5 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#4232c2] to-[#6366f1] rounded-xl flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">Pathclub</span>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`rounded-full transition-all duration-500 ${
                step === s
                  ? 'w-6 h-2.5 bg-[#4232c2]'
                  : i < STEPS.indexOf(step)
                    ? 'w-2.5 h-2.5 bg-[#4232c2]/40'
                    : 'w-2.5 h-2.5 bg-gray-200'
              }`}
            />
          ))}
        </div>

        <button
          id="onboarding-skip"
          onClick={handleSkip}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors group"
        >
          <SkipForward size={15} className="group-hover:translate-x-0.5 transition-transform" />
          Skip
        </button>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-6">
        <div className="w-full max-w-2xl">

          {/* ════════ STEP: SELECT ════════ */}
          {step === 'select' && (
            <div className="space-y-6">
              {/* Hero text */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full text-indigo-600 text-sm font-semibold mb-4">
                  <Zap size={14} className="fill-indigo-500" />
                  Personalisasi profil karir kamu
                </div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-3 flex items-center justify-center gap-2">
                  Temukan Karir Impianmu <Sparkles size={24} className="text-indigo-600" />
                </h1>
                <p className="text-gray-500 text-base max-w-md mx-auto">
                  Pilih skill &amp; minat kamu, lalu AI kami akan merekomendasikan jalur karir yang paling cocok.
                </p>
              </div>

              {/* Skills card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Lightbulb size={18} className="text-amber-500" />
                      <span>Keahlian</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Pilih skill yang kamu kuasai</p>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                    {selectedSkills.length} dipilih
                  </span>
                </div>

                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedSkills.map(skill => (
                      <div
                        key={skill}
                        className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-indigo-100 animate-in fade-in zoom-in duration-200"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  id="add-skills-btn"
                  onClick={() => setIsSkillsOpen(true)}
                  className="w-full py-3 flex items-center justify-center gap-2 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100/70 border border-dashed border-indigo-200 rounded-xl font-medium transition-all text-sm"
                >
                  <Plus size={16} />
                  Tambahkan Keahlian
                </button>
              </div>

              {/* Interests card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Star size={18} className="text-purple-500 fill-purple-500" />
                      <span>Minat</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Apa yang paling kamu minati?</p>
                  </div>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                    {selectedInterests.length} dipilih
                  </span>
                </div>

                {selectedInterests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedInterests.map(interest => (
                      <div
                        key={interest}
                        className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-purple-100 animate-in fade-in zoom-in duration-200"
                      >
                        {interest}
                        <button
                          onClick={() => removeInterest(interest)}
                          className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  id="add-interests-btn"
                  onClick={() => setIsInterestsOpen(true)}
                  className="w-full py-3 flex items-center justify-center gap-2 text-purple-600 bg-purple-50/50 hover:bg-purple-100/70 border border-dashed border-purple-200 rounded-xl font-medium transition-all text-sm"
                >
                  <Plus size={16} />
                  Tambahkan Minat
                </button>
              </div>

              {/* Validation info */}
              {!isSubmitReady && totalSelected > 0 && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-100 px-4 py-3 rounded-xl text-sm font-medium">
                  <AlertCircle size={15} />
                  Pilih {3 - totalSelected} item lagi untuk melanjutkan
                </div>
              )}

              {/* CTA Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  id="get-recommendation-btn"
                  onClick={handlePredict}
                  disabled={!isSubmitReady || isLoading}
                  className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-base transition-all duration-300
                    ${!isSubmitReady
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#4232c2] to-[#6366f1] hover:from-[#3426a1] hover:to-[#5254cc] text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 active:scale-[0.98]'
                    }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Menganalisis profilmu...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Dapatkan Rekomendasi Karir
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <button
                  id="skip-onboarding-btn"
                  onClick={handleSkip}
                  className="w-full py-3.5 rounded-2xl text-gray-400 hover:text-gray-600 font-medium text-sm transition-colors hover:bg-gray-50"
                >
                  Lewati untuk sekarang
                </button>
              </div>
            </div>
          )}

          {/* ════════ STEP: RESULT ════════ */}
          {step === 'result' && predictionResult && (
            <div className={`space-y-5 transition-all duration-700 ${animateResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

              <div className="text-center mb-2">
                <p className="text-sm font-semibold text-indigo-500 tracking-wide uppercase mb-2">Hasil Analisis AI</p>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">Rekomendasi Karir Kamu <Sparkles size={20} className="text-amber-500" /></h1>
              </div>

              {/* Top Career Card */}
              <div className={`bg-gradient-to-br ${meta?.color || 'from-[#4232c2] to-[#6366f1]'} rounded-3xl p-7 text-white shadow-2xl relative overflow-hidden`}>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mt-12 -mr-12 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -mb-10 -ml-10 blur-2xl" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                      <Target size={16} />
                      Jalur karir terbaik untukmu
                    </div>
                    {(() => { const CareerIcon = meta?.Icon || Lightbulb; return <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><CareerIcon size={22} className="text-white" /></div>; })()}
                  </div>
                  <h2 className="text-3xl font-extrabold mb-3 tracking-tight">
                    {predictionResult.prediction}
                  </h2>
                  <p className="text-white/85 text-sm leading-relaxed max-w-xs">
                    {meta?.desc || 'Jalur karir yang paling sesuai dengan profil kamu'}
                  </p>

                  <div className="mt-5 flex items-center gap-1.5 text-white/90 text-sm font-semibold">
                    <Star size={14} className="fill-white/80" />
                    {Math.round((Object.values(predictionResult.probabilities || {}).reduce((a, b) => Math.max(a, b), 0)) * 100)}% kecocokan
                  </div>
                </div>
              </div>

              {/* Probability Breakdown */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2"><TrendingUp size={16} className="text-indigo-500" /> Analisis Kecocokan</h3>
                <div className="space-y-4">
                  {Object.entries(predictionResult.probabilities || {})
                    .sort(([, a], [, b]) => b - a)
                    .map(([career, prob], idx) => {
                      const pct  = Math.round(prob * 100);
                      const m    = careerMeta[career] || {};
                      const isTop = idx === 0;
                      const CareerMIcon = m.Icon || Globe2;
                      return (
                        <div key={career}>
                          <div className="flex justify-between items-center mb-1.5">
                            <div className="flex items-center gap-2">
                              <CareerMIcon size={14} className={isTop ? 'text-[#4232c2]' : 'text-gray-400'} />
                              <span className={`text-sm font-semibold ${isTop ? 'text-[#4232c2]' : 'text-gray-700'}`}>
                                {career}
                              </span>
                              {isTop && (
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                  Top Pick
                                </span>
                              )}
                            </div>
                            <span className={`text-sm font-bold ${isTop ? 'text-[#4232c2]' : 'text-gray-500'}`}>
                              {pct}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                isTop
                                  ? 'bg-gradient-to-r from-[#4232c2] to-[#6366f1]'
                                  : idx === 1
                                    ? 'bg-indigo-300'
                                    : idx === 2
                                      ? 'bg-indigo-200'
                                      : 'bg-gray-200'
                              }`}
                              style={{
                                width:             `${pct}%`,
                                transitionDelay:   `${idx * 120}ms`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Berdasarkan profil kamu</p>
                <div className="flex flex-wrap gap-2">
                  {[...selectedSkills, ...selectedInterests].map(tag => (
                    <span key={tag} className="text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                {saveSuccess ? (
                  <div className="w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-base bg-emerald-500 text-white shadow-lg shadow-emerald-200 animate-in zoom-in duration-300">
                    <CheckCircle2 size={20} />
                    Tersimpan! Menuju Dashboard...
                  </div>
                ) : (
                  <button
                    id="save-recommendation-btn"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-base bg-gradient-to-r from-[#4232c2] to-[#6366f1] hover:from-[#3426a1] hover:to-[#5254cc] text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all active:scale-[0.98] disabled:opacity-70"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        Simpan &amp; Mulai Belajar
                        <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                )}

                <button
                  id="retake-recommendation-btn"
                  onClick={() => { setStep('select'); setAnimateResult(false); setPredictionResult(null); }}
                  className="w-full py-3 rounded-2xl text-gray-400 hover:text-gray-600 font-medium text-sm transition-colors hover:bg-gray-50"
                >
                  ← Ubah pilihan
                </button>

                <button
                  id="skip-save-btn"
                  onClick={handleSkip}
                  className="w-full py-2.5 rounded-xl text-gray-300 hover:text-gray-400 font-medium text-xs transition-colors"
                >
                  Lewati, masuk tanpa simpan
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Bottom Sheet Selectors ── */}
      <BottomSheetSelector
        isOpen={isSkillsOpen}
        onClose={() => setIsSkillsOpen(false)}
        title="Tambahkan Keahlian"
        items={availableSkills}
        selectedItems={selectedSkills}
        onConfirm={setSelectedSkills}
      />
      <BottomSheetSelector
        isOpen={isInterestsOpen}
        onClose={() => setIsInterestsOpen(false)}
        title="Tambahkan Minat"
        items={availableInterests}
        selectedItems={selectedInterests}
        onConfirm={setSelectedInterests}
      />
    </div>
  );
}
