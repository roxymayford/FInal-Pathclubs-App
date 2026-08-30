import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initialDashboardData } from '../data/mockData';

const AuthContext = createContext(null);

const FLASK_API = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000/api';
const LARAVEL_API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser]               = useState(null);
  const [dashboardData, setDashboardData] = useState(initialDashboardData);
  const [hasRecommendation, setHasRecommendation] = useState(() => localStorage.getItem('has_recommendation') === 'true');
  const [isLoading, setIsLoading]     = useState(true);
  const saveTimeoutRef                = useRef(null);

  // ─── Sync stats helper ────────────────────────────────────────────────────
  const handleSetDashboardData = (newData) => {
    if (!newData) {
      setDashboardData(newData);
      return;
    }
    const syncedData = JSON.parse(JSON.stringify(newData));
    if (!syncedData.completedModules) syncedData.completedModules = [];
    const completedCount = syncedData.completedModules.length;

    const modulStat = syncedData.stats?.find(s => s.id === 2);
    if (modulStat) modulStat.value = completedCount.toString();

    const xpStat = syncedData.stats?.find(s => s.id === 4);
    if (xpStat) {
      const moduleXp = completedCount * 50;
      const quizXp   = syncedData.quizXp || 0;
      xpStat.value   = (moduleXp + quizXp).toString();
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (syncedData.lastLoginDate !== todayStr) {
      let currentStreak = parseInt(syncedData.stats?.find(s => s.id === 3)?.value || '0');

      if (syncedData.lastLoginDate) {
        const todayMs = new Date(todayStr).getTime();
        const lastMs  = new Date(syncedData.lastLoginDate).getTime();
        const diffDays = Math.round((todayMs - lastMs) / (1000 * 60 * 60 * 24));
        if (diffDays === 1)      currentStreak += 1;
        else if (diffDays > 1)   currentStreak  = 1;
      } else {
        currentStreak = 1;
      }

      const streakStat = syncedData.stats?.find(s => s.id === 3);
      if (streakStat) streakStat.value = currentStreak.toString();

      syncedData.lastLoginDate = todayStr;
      if (syncedData.dailyTarget) syncedData.dailyTarget.currentMinutes = 0;
    }

    if (!syncedData.unlockedBadges) syncedData.unlockedBadges = [];
    if (!syncedData.notifications)  syncedData.notifications  = [];

    const badgeStreak = parseInt(syncedData.stats?.find(s => s.id === 3)?.value || '0');
    const badgeModule = syncedData.completedModules.length;
    const badgeQuiz   = syncedData.completedQuizzes?.length || 0;
    const badgeXp     = parseInt(syncedData.stats?.find(s => s.id === 4)?.value || '0');
    const badgeLevel  = Math.floor(badgeXp / 100) + 1;

    const checkBadge = (id, title, condition) => {
      if (condition && !syncedData.unlockedBadges.includes(id)) {
        syncedData.unlockedBadges.push(id);
        syncedData.notifications.unshift({
          id:          Date.now() + Math.random(),
          type:        'achievement',
          unread:      true,
          title:       `Badge Baru: ${title}`,
          time:        'Baru saja',
          description: `Selamat! Kamu telah membuka badge ${title}. Terus tingkatkan prestasimu!`,
          iconName:    'Award',
        });
      }
    };

    checkBadge('pemula',   'Pemula',         badgeLevel  >= 2);
    checkBadge('rajin',    'Pelajar Rajin',   badgeModule >= 1);
    checkBadge('ahli',     'Ahli Materi',     badgeModule >= 3);
    checkBadge('jenius',   'Si Jenius',       badgeQuiz   >= 1);
    checkBadge('konsisten','Konsisten',        badgeStreak >= 3);
    checkBadge('master',   'Master Kuis',     badgeQuiz   >= 3);
    checkBadge('kutu',     'Kutu Buku',       badgeLevel  >= 5);
    checkBadge('legenda',  'Legenda',         badgeXp     >= 1000);

    setDashboardData(syncedData);
    return syncedData;
  };

  // ─── Save progress to backend (debounced) ──────────────────────────────────
  const saveProgressToBackend = async (data, userId) => {
    if (!userId || !data) return;
    
    try {
      await fetch(`${FLASK_API}/progress/${userId}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          completedModules:  data.completedModules || [],
          completedQuizzes:  data.completedQuizzes || [],
          quizXp:            data.quizXp || 0,
          dailyTarget:       data.dailyTarget || {},
          preferences:       data.preferences || {},
          unlockedBadges:    data.unlockedBadges || [],
          lastLoginDate:     data.lastLoginDate || null,
          stats:             data.stats || [],
          notifications:     data.notifications || [],
        }),
      });
    } catch (err) {
      console.error('Failed to save progress to backend:', err);
    }
  };

  // ─── Restore session on mount ─────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUserStr = localStorage.getItem('authUser') || localStorage.getItem('googleUser');
        const storedUserId = localStorage.getItem('user_id');

        if (storedUserStr || storedUserId) {
          const parsedUser = storedUserStr ? JSON.parse(storedUserStr) : { id: storedUserId };
          const activeUserId = parsedUser.id || storedUserId;

          let userData = { ...parsedUser, id: activeUserId };
          
          // Attempt to fetch latest user info from DB
          if (activeUserId) {
            try {
              const uRes = await fetch(`${FLASK_API}/user/${activeUserId}`);
              if (uRes.ok) {
                const uJson = await uRes.json();
                if (uJson.user) {
                  userData = { ...userData, ...uJson.user };
                }
              }
            } catch (_) {}
          }

          setUser(userData);

          const newData        = JSON.parse(JSON.stringify(initialDashboardData));
          newData.user.name    = userData.name || 'Pelajar';
          newData.user.email   = userData.email || '';
          newData.user.avatar  = userData.avatar || '';
          newData.user.grade   = userData.grade || 'SMA Kelas 10';

          if (activeUserId) {
            try {
              const res = await fetch(`${FLASK_API}/progress/${activeUserId}`);
              if (res.ok) {
                const result = await res.json();
                if (result.progress) {
                  const backendProgress = result.progress;
                  newData.completedModules = backendProgress.completedModules || [];
                  newData.completedQuizzes = backendProgress.completedQuizzes || [];
                  newData.quizXp           = backendProgress.quizXp || 0;
                  newData.dailyTarget      = backendProgress.dailyTarget || { targetMinutes: 60, currentMinutes: 0 };
                  newData.preferences      = backendProgress.preferences || {};
                  newData.unlockedBadges   = backendProgress.unlockedBadges || [];
                  newData.lastLoginDate    = backendProgress.lastLoginDate || null;
                  newData.stats            = backendProgress.stats || newData.stats;
                  newData.notifications    = backendProgress.notifications || [];
                }
              }
            } catch (fetchErr) {
              console.warn('Could not fetch backend progress, using cached data:', fetchErr);
            }
          if (activeUserId) {
            try {
              const recRes = await fetch(`${FLASK_API}/recommendation/${activeUserId}`);
              if (recRes.ok) {
                const recJson = await recRes.json();
                if (recJson.recommendation && recJson.recommendation.top_career) {
                  setHasRecommendation(true);
                  localStorage.setItem('has_recommendation', 'true');
                  userData.has_recommendation = true;
                } else {
                  setHasRecommendation(false);
                  localStorage.removeItem('has_recommendation');
                  userData.has_recommendation = false;
                }
              }
            } catch (_) {}
          }

          handleSetDashboardData(newData);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error('Session restore error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ─── Auto-save dashboardData to Database (debounced) ───────────────────────
  useEffect(() => {
    if (user && user.id && dashboardData) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveProgressToBackend(dashboardData, user.id);
      }, 1000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [dashboardData, user]);

  // ─── LOGIN (email + password) ─────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${FLASK_API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Email atau kata sandi tidak valid');
      }

      const dbUser = resData.user;
      const progress = resData.progress;

      localStorage.setItem('authUser', JSON.stringify(dbUser));
      localStorage.setItem('user_id', String(dbUser.id));
      localStorage.setItem('currentUser', dbUser.email);

      setUser(dbUser);

      const newData       = JSON.parse(JSON.stringify(initialDashboardData));
      newData.user.name   = dbUser.name;
      newData.user.email  = dbUser.email;
      newData.user.avatar = dbUser.avatar || '';
      newData.user.grade  = dbUser.grade || 'SMA Kelas 10';

      if (progress) {
        newData.completedModules = progress.completedModules || [];
        newData.completedQuizzes = progress.completedQuizzes || [];
        newData.quizXp           = progress.quizXp || 0;
        newData.dailyTarget      = progress.dailyTarget || { targetMinutes: 60, currentMinutes: 0 };
        newData.preferences      = progress.preferences || {};
        newData.unlockedBadges   = progress.unlockedBadges || [];
        newData.lastLoginDate    = progress.lastLoginDate || null;
        newData.stats            = progress.stats || newData.stats;
        newData.notifications    = progress.notifications || [];
      }

      const hasRec = Boolean(resData.has_recommendation);
      setHasRecommendation(hasRec);
      if (hasRec) {
        localStorage.setItem('has_recommendation', 'true');
      } else {
        localStorage.removeItem('has_recommendation');
      }

      handleSetDashboardData(newData);
      setIsLoading(false);

      return {
        success: true,
        user: dbUser,
        is_new_user: resData.is_new_user,
        has_recommendation: hasRec,
        user_id: dbUser.id
      };
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  // ─── LOGIN WITH GOOGLE (ID Token Credential) ──────────────────────────────
  const loginWithGoogle = async (credential) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${FLASK_API}/auth/google`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ credential }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Google login failed');
      }

      const result = await response.json();
      const { user: googleUser, is_new_user, has_recommendation, progress } = result;

      // Persist Google session
      localStorage.setItem('authUser', JSON.stringify(googleUser));
      localStorage.setItem('googleUser', JSON.stringify(googleUser));
      localStorage.setItem('user_id', String(googleUser.id));

      setUser({
        ...googleUser,
        isGoogle: true,
      });

      const newData         = JSON.parse(JSON.stringify(initialDashboardData));
      newData.user.name     = googleUser.name;
      newData.user.email    = googleUser.email;
      newData.user.avatar   = googleUser.avatar;
      newData.user.grade    = googleUser.grade || 'SMA Kelas 10';
      
      if (progress) {
        newData.completedModules = progress.completedModules || [];
        newData.completedQuizzes = progress.completedQuizzes || [];
        newData.quizXp           = progress.quizXp || 0;
        newData.dailyTarget      = progress.dailyTarget || { targetMinutes: 60, currentMinutes: 0 };
        newData.preferences      = progress.preferences || {};
        newData.unlockedBadges   = progress.unlockedBadges || [];
        newData.lastLoginDate    = progress.lastLoginDate || null;
        newData.stats            = progress.stats || newData.stats;
        newData.notifications    = progress.notifications || [];
      }

      const hasRec = Boolean(has_recommendation);
      setHasRecommendation(hasRec);
      if (hasRec) {
        localStorage.setItem('has_recommendation', 'true');
      } else {
        localStorage.removeItem('has_recommendation');
        localStorage.removeItem('career_recommendation');
      }

      handleSetDashboardData(newData);
      setIsLoading(false);

      return {
        success:            true,
        is_new_user,
        has_recommendation: hasRec,
        user_id:            googleUser.id,
      };
    } catch (err) {
      console.error('Google login error:', err);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  // ─── LOGIN WITH GOOGLE TOKEN (Access Token + User Info) ───────────────────
  const loginWithGoogleToken = async (accessToken, userInfo) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${FLASK_API}/auth/google-token`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          access_token: accessToken,
          user_info:    userInfo,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Google authentication failed');
      }

      const result = await response.json();
      const { user: googleUser, is_new_user, has_recommendation, progress } = result;

      // Persist Google session
      localStorage.setItem('authUser', JSON.stringify(googleUser));
      localStorage.setItem('googleUser', JSON.stringify(googleUser));
      localStorage.setItem('user_id', String(googleUser.id));

      const hasRec = Boolean(has_recommendation);
      setHasRecommendation(hasRec);
      if (hasRec) {
        localStorage.setItem('has_recommendation', 'true');
      } else {
        localStorage.removeItem('has_recommendation');
        localStorage.removeItem('career_recommendation');
      }

      setUser({
        ...googleUser,
        isGoogle: true,
      });

      const newData         = JSON.parse(JSON.stringify(initialDashboardData));
      newData.user.name     = googleUser.name;
      newData.user.email    = googleUser.email;
      newData.user.avatar   = googleUser.avatar;
      newData.user.grade    = googleUser.grade || 'SMA Kelas 10';
      
      if (progress) {
        newData.completedModules = progress.completedModules || [];
        newData.completedQuizzes = progress.completedQuizzes || [];
        newData.quizXp           = progress.quizXp || 0;
        newData.dailyTarget      = progress.dailyTarget || { targetMinutes: 60, currentMinutes: 0 };
        newData.preferences      = progress.preferences || {};
        newData.unlockedBadges   = progress.unlockedBadges || [];
        newData.lastLoginDate    = progress.lastLoginDate || null;
        newData.stats            = progress.stats || newData.stats;
        newData.notifications    = progress.notifications || [];
      }

      handleSetDashboardData(newData);
      setIsLoading(false);

      return {
        success:            true,
        is_new_user,
        has_recommendation: hasRec,
        user_id:            googleUser.id,
      };
    } catch (err) {
      console.error('Google token login error:', err);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  // ─── REGISTER (email + password) ──────────────────────────────────────────
  const register = async (username, email, password) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${FLASK_API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username, email, password })
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Gagal mendaftar');
      }

      const dbUser = resData.user;
      const progress = resData.progress;

      localStorage.setItem('authUser', JSON.stringify(dbUser));
      localStorage.setItem('user_id', String(dbUser.id));
      localStorage.setItem('currentUser', dbUser.email);
      localStorage.removeItem('has_recommendation');
      localStorage.removeItem('career_recommendation');
      setHasRecommendation(false);

      setUser(dbUser);

      const newData       = JSON.parse(JSON.stringify(initialDashboardData));
      newData.user.name   = dbUser.name;
      newData.user.email  = dbUser.email;
      newData.user.avatar = dbUser.avatar || '';
      newData.user.grade  = dbUser.grade || 'SMA Kelas 10';

      if (progress) {
        newData.completedModules = progress.completedModules || [];
        newData.completedQuizzes = progress.completedQuizzes || [];
        newData.quizXp           = progress.quizXp || 0;
        newData.dailyTarget      = progress.dailyTarget || { targetMinutes: 60, currentMinutes: 0 };
        newData.preferences      = progress.preferences || {};
        newData.unlockedBadges   = progress.unlockedBadges || [];
        newData.lastLoginDate    = progress.lastLoginDate || null;
        newData.stats            = progress.stats || newData.stats;
        newData.notifications    = progress.notifications || [];
      }

      handleSetDashboardData(newData);
      setIsLoading(false);

      return {
        success: true,
        user: dbUser,
        is_new_user: true,
        user_id: dbUser.id
      };
    } catch (err) {
      console.error('Register error:', err);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  // ─── UPDATE USER PROFILE (Database) ───────────────────────────────────────
  const updateUserProfile = async (profileData) => {
    if (!user || !user.id) return { success: false, error: 'User tidak ditemukan' };

    try {
      const res = await fetch(`${FLASK_API}/user/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Gagal memperbarui profil');

      const updatedUser = resData.user;
      setUser(prev => ({ ...prev, ...updatedUser }));
      localStorage.setItem('authUser', JSON.stringify({ ...user, ...updatedUser }));

      const newData = JSON.parse(JSON.stringify(dashboardData));
      if (!newData.user) newData.user = {};
      if (updatedUser.name) newData.user.name = updatedUser.name;
      if (updatedUser.avatar !== undefined) newData.user.avatar = updatedUser.avatar;
      if (updatedUser.grade) newData.user.grade = updatedUser.grade;

      handleSetDashboardData(newData);
      return { success: true, user: updatedUser };
    } catch (err) {
      console.error('Update profile error:', err);
      return { success: false, error: err.message };
    }
  };

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  const logout = () => {
    if (user && user.id && dashboardData) {
      saveProgressToBackend(dashboardData, user.id);
    }
    
    localStorage.removeItem('authUser');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('googleUser');
    localStorage.removeItem('user_id');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('has_recommendation');
    localStorage.removeItem('career_recommendation');
    setHasRecommendation(false);
    setUser(null);
    setDashboardData(initialDashboardData);
  };

  return (
    <AuthContext.Provider value={{
      user,
      hasRecommendation,
      setHasRecommendation,
      login,
      loginWithGoogle,
      loginWithGoogleToken,
      register,
      logout,
      dashboardData,
      setDashboardData: handleSetDashboardData,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
