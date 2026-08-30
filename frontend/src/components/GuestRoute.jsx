import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

/**
 * GuestRoute — membungkus halaman login/register.
 * - Jika sedang loading (restore session) → tampilkan LoadingScreen
 * - Jika sudah login → redirect ke /dashboard (tidak perlu login lagi)
 * - Jika belum login → render halaman login/register
 */
const GuestRoute = () => {
  const { user, isLoading, hasRecommendation } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (user) {
    const isDone = user.has_recommendation === true || (user.has_recommendation === undefined && hasRecommendation);
    if (!isDone) {
      return <Navigate to="/career-onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
