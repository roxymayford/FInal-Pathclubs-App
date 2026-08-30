import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Settings from './pages/Settings';
import Materi from './pages/Materi';
import Notifications from './pages/Notifications';
import Progress from './pages/Progress';
import LearningPath from './pages/LearningPath';
import LatihanSoal from './pages/LatihanSoal';
import Quiz from './pages/Quiz';
import Pencapaian from './pages/Pencapaian';
import MateriDetail from './pages/MateriDetail';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Rekomendasi from './pages/Rekomendasi';
import CareerOnboarding from './pages/CareerOnboarding';
import GoogleCallback from './pages/GoogleCallback';
import AdminDashboard from './pages/AdminDashboard';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '244826909624-055j98h4rd5m8m9ruvami0invr46muof.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
          <Router>
            <SidebarProvider>
            <Routes>
              {/* Redirect root to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />

            {/* ─── Guest Routes (sudah login = redirect ke dashboard) ─── */}
            <Route element={<GuestRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="/login"    element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
            </Route>

            {/* Google OAuth Callback (public, no guard) */}
            <Route path="/auth/callback" element={<GoogleCallback />} />

            {/* ─── Protected Routes (belum login = redirect ke login) ─── */}
            <Route element={<ProtectedRoute />}>
              {/* Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Career Onboarding (post sign-up) */}
              <Route path="/career-onboarding" element={<CareerOnboarding />} />

              {/* Assessment Route */}
              <Route path="/assessment" element={<Assessment />} />

              {/* Settings Route */}
              <Route path="/settings" element={<Settings />} />

              {/* Profile Route */}
              <Route path="/profile" element={<Profile />} />

              {/* Progress Route */}
              <Route path="/progress" element={<Progress />} />

              {/* Learning Path Route */}
              <Route path="/learning-path" element={<LearningPath />} />

              {/* Latihan Soal Route */}
              <Route path="/latihan" element={<LatihanSoal />} />

              {/* Quiz Route */}
              <Route path="/quiz" element={<Quiz />} />

              {/* Pencapaian Route */}
              <Route path="/pencapaian" element={<Pencapaian />} />

              {/* Notifications Route */}
              <Route path="/notifications" element={<Notifications />} />

              {/* Materi Routes */}
              <Route path="/materi"        element={<Materi />} />
              <Route path="/materi/detail" element={<MateriDetail />} />

              {/* Admin Dashboard Routes */}
              <Route path="/admin"        element={<AdminDashboard />} />
              <Route path="/admin/materi" element={<AdminDashboard />} />

              {/* Rekomendasi Karir Route */}
              <Route path="/rekomendasi" element={<Rekomendasi />} />
            </Route>

            {/* 404 Catch All Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
            </SidebarProvider>
          </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
