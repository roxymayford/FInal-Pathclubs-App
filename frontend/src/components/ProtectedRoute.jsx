import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

/**
 * ProtectedRoute — membungkus halaman yang membutuhkan autentikasi.
 * - Jika sedang loading (restore session) → tampilkan LoadingScreen
 * - Jika belum login (user === null) → redirect ke /login
 * - Jika sudah login tetapi belum punya rekomendasi karir (dan mengakses halaman selain /career-onboarding) → redirect ke /career-onboarding
 * - Jika sudah login & memenuhi syarat → render children
 */
const ProtectedRoute = () => {
  const { user, isLoading, hasRecommendation } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isDone = Boolean(hasRecommendation || user.has_recommendation);
  if (!isDone && location.pathname !== '/career-onboarding') {
    return <Navigate to="/career-onboarding" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
