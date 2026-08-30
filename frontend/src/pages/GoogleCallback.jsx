import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const FLASK_API = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000/api';

const GoogleCallback = () => {
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const error  = params.get('error');
      const token  = params.get('token');
      const userId = params.get('user_id');
      const email  = params.get('email');
      const name   = params.get('name');

      if (error || !token) {
        window.location.href = '/login?error=google_failed';
        return;
      }

      // Simpan data ke localStorage untuk API
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_id', userId);

      // Simpan sesi Google agar AuthContext bisa merestore-nya
      localStorage.setItem('googleUser', JSON.stringify({
        id: userId,
        email: email,
        name: name,
        isGoogle: true
      }));

      // Cek apakah user sudah punya rekomendasi karir
      let hasRec = false;
      try {
        const res = await fetch(`${FLASK_API}/recommendation/${userId}`);
        if (res.ok) {
          const data = await res.json();
          hasRec = Boolean(data.recommendation && data.recommendation.top_career);
        }
      } catch (_) {}

      if (hasRec) {
        localStorage.setItem('has_recommendation', 'true');
        window.location.href = '/dashboard';
      } else {
        localStorage.removeItem('has_recommendation');
        window.location.href = '/career-onboarding';
      }
    };

    handleCallback();
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Inter, sans-serif',
      color: '#4b5563'
    }}>
      <div style={{
        width: 48, height: 48,
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #6366f1',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: 16
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: 16, fontWeight: 500 }}>Memproses login Google...</p>
    </div>
  );
};

export default GoogleCallback;
