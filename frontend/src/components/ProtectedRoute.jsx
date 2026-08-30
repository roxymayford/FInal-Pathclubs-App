import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

/**
 * ProtectedRoute — membungkus halaman yang membutuhkan autentikasi.
 * - Jika sedang loading (restore session) → tampilkan LoadingScreen
 * - Jika belum login (user === null) → redirect ke /login
 * - Jika sudah login → render children
 */
const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
