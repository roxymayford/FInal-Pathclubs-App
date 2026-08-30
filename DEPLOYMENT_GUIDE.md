# 🚀 Panduan Deployment Terpisah (1 per 1)

Aplikasi ini terdiri dari 3 service terpisah:
1. **Flask (ML Backend & Predictions)**
2. **Laravel (API Server & Auth/MySQL)**
3. **React + Vite (Frontend SPA)**

---

## 📌 Rekomendasi Tempat Deploy (Paling Praktis & Gratis/Murah)

| Bagian | Rekomendasi Platform | Alternatif |
|---|---|---|
| **Frontend (Vite)** | **Vercel** / **Netlify** / **Cloudflare Pages** | VPS Nginx, GitHub Pages |
| **Backend (Laravel)** | **Railway** / **Render** / **VPS (Ubuntu + Nginx)** | cPanel (Shared Hosting) |
| **ML Backend (Flask)** | **Render** / **Railway** / **PythonAnywhere** | VPS (Systemd / Docker) |

---

## 1️⃣ DEPLOY FLASK (Machine Learning API)

### Opsi A: Deploy di Render (Web Service)
1. Buat akun di [render.com](https://render.com).
2. Klik **New +** -> **Web Service**.
3. Hubungkan repository GitHub project ini.
4. Konfigurasi Service:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app` (atau gunakan Dockerfile yang sudah disiapkan)
5. Isi **Environment Variables**:
   - `PORT`: `5000` (atau biarkan default Render)
   - `GOOGLE_CLIENT_ID`: `244826909624-055j98h4rd5m8m9ruvami0invr46muof.apps.googleusercontent.com`
   - `ADMIN_USERNAME`: `iscLP`
   - `ADMIN_PASSWORD`: `kelompok9`
6. Deploy! Catat URL hasil deploy Flask, contoh: `https://learning-path-flask.onrender.com`.

---

## 2️⃣ DEPLOY LARAVEL (Main API & Authentication)

### Deploy di Railway / Render / VPS (Database Supabase PostgreSQL)
1. Gunakan folder `laravel/server`.
2. Database Supabase PostgreSQL sudah siap.
3. Buat service baru di Railway/Render dengan **Root Directory**: `laravel/server`.
4. Isi **Environment Variables**:
   - `APP_NAME`: `LearningPath`
   - `APP_ENV`: `production`
   - `APP_KEY`: `base64:a5wOwraabMNcV4syaEwiTRjKIWskybJ0xyRVczkq3ng=`
   - `APP_DEBUG`: `false`
   - `APP_URL`: `https://your-laravel-domain.up.railway.app`
   - `DB_CONNECTION`: `pgsql`
   - `DB_HOST`: `aws-0-ap-southeast-2.pooler.supabase.com`
   - `DB_PORT`: `6543`
   - `DB_DATABASE`: `postgres`
   - `DB_USERNAME`: `postgres.mthqkjcudruvaycbdexm`
   - `DB_PASSWORD`: `FumihikoAldo`
   - `DB_SSLMODE`: `require`
   - `DB_URL`: `postgresql://postgres.mthqkjcudruvaycbdexm:FumihikoAldo@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres`
   - `RUN_MIGRATIONS`: `true`
5. Deploy! Catat URL Laravel kamu, contoh: `https://learning-path-api.up.railway.app`.

---

## 3️⃣ DEPLOY VITE (React Frontend)

### Opsi A: Deploy di Vercel (Paling Cepat & Stabil)
1. Buat akun di [vercel.com](https://vercel.com).
2. Klik **Add New...** -> **Project** -> Impor repo GitHub kamu.
3. Konfigurasi Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Klik Edit dan pilih `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Isi **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://<URL_LARAVEL_KAMU>/api` (contoh: `https://learning-path-api.up.railway.app/api`)
   - `VITE_ML_API_URL`: `https://<URL_FLASK_KAMU>/api` (contoh: `https://learning-path-flask.onrender.com/api`)
   - `VITE_GOOGLE_CLIENT_ID`: `244826909624-055j98h4rd5m8m9ruvami0invr46muof.apps.googleusercontent.com`
5. Klik **Deploy**. File [vercel.json](file:///c:/Users/SANRIO/Documents/Default%20Project/Learning%20Path%20A/frontend/vercel.json) sudah disiapkan otomatis agar routing React Router tidak 404 saat di-refresh!

---

## 4️⃣ CARA MENGHUBUNGKAN KETIGANYA (Checklist Akhir)

1. Pastikan **Google Cloud Console OAuth Client**:
   - Di [Google Cloud Console](https://console.cloud.google.com/apis/credentials), tambahkan domain frontend kamu (contoh `https://learning-path.vercel.app`) ke:
     - **Authorized JavaScript origins**
     - **Authorized redirect URIs**
2. Update `.env` di Frontend dengan URL domain asli Backend & Flask.
3. Jika menggunakan Docker di VPS sendiri, Anda cukup menjalankan:
   ```bash
   docker compose up -d --build
   ```
