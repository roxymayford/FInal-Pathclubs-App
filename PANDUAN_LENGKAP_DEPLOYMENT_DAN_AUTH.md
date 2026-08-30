# 📘 PANDUAN LENGKAP DEPLOYMENT & GOOGLE OAUTH
**Project: Learning Path App (Flask ML + Laravel 11 + React Vite + Supabase + Google OAuth)**

---

## 📑 DAFTAR ISI
1. [Ringkasan Arsitektur & Layanan Cloud](#1-ringkasan-arsitektur--layanan-cloud)
2. [Langkah 1: Deploy Flask ML API di Railway](#2-langkah-1-deploy-flask-ml-api-di-railway)
3. [Langkah 2: Deploy Laravel 11 Server di Railway (Database Supabase)](#3-langkah-2-deploy-laravel-11-server-di-railway)
4. [Langkah 3: Deploy Frontend React + Vite di Vercel](#4-langkah-3-deploy-frontend-react--vite-di-vercel)
5. [Langkah 4: Konfigurasi Lengkap Google OAuth Console](#5-langkah-4-konfigurasi-lengkap-google-oauth-console)
6. [Langkah 5: Pengujian & Troubleshooting](#6-langkah-5-pengujian--troubleshooting)

---

## 1. Ringkasan Arsitektur & Layanan Cloud

| Komponen | Framework / Bahasa | Platform Deploy | Database / Auth |
|---|---|---|---|
| **Backend ML** | Python (Flask, Scikit-Learn) | **Railway** | Supabase PostgreSQL / Local Model |
| **Backend API** | PHP 8.3 (Laravel 11, Sanctum) | **Railway (Docker)** | **Supabase PostgreSQL** |
| **Frontend** | React 19 + Vite + TailwindCSS | **Vercel** | Google OAuth (@react-oauth/google) |
| **Database** | PostgreSQL | **Supabase Cloud** | Host: `aws-0-ap-southeast-2.pooler.supabase.com` |

---

## 2. Langkah 1: Deploy Flask ML API di Railway

1. Buka [Railway.com](https://railway.com) $\rightarrow$ Login via GitHub.
2. Klik **+ New Project** $\rightarrow$ Pilih **Deploy from GitHub repo** $\rightarrow$ Pilih repo `FInal-Pathclubs-App`.
3. Klik kotak service yang baru muncul di Canvas $\rightarrow$ Buka tab **Settings**:
   * **Service Name**: Ganti menjadi `flask-backend`
   * Scroll ke bawah ke bagian **Build** $\rightarrow$ **Root Directory**: Ubah menjadi `/backend`
4. Buka tab **Variables** $\rightarrow$ Klik tombol **RAW Editor** $\rightarrow$ Paste:
   ```env
   PORT=5000
   FLASK_ENV=production
   ADMIN_USERNAME=iscLP
   ADMIN_PASSWORD=kelompok9
   GOOGLE_CLIENT_ID=244826909624-055j98h4rd5m8m9ruvami0invr46muof.apps.googleusercontent.com
   DATABASE_URL=postgresql://postgres.mthqkjcudruvaycbdexm:FumihikoAldo@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres
   ```
5. Buka tab **Networking** (di menu Settings atau tab Networking):
   * Klik **Generate Domain**
   * Pastikan Port adalah `5000`
6. 📌 **Catat URL Flask Anda**, contoh:
   `https://flask-backend-production-xxxx.up.railway.app`
7. *Tes API di browser:* Buka `https://flask-backend-production-xxxx.up.railway.app/api/skills`
   *(Jika keluar data JSON, berarti Flask berhasil aktif)*.

---

## 3. Langkah 2: Deploy Laravel 11 Server di Railway

1. Di dalam project Canvas Railway yang sama, klik tombol **+ Create** (atau **+ New Service**) di pojok kanan atas.
2. Pilih **GitHub Repo** $\rightarrow$ Pilih kembali repository `FInal-Pathclubs-App`.
3. Klik kotak service kedua tersebut $\rightarrow$ Buka tab **Settings**:
   * **Service Name**: Ganti menjadi `laravel-server`
   * Scroll ke bawah ke bagian **Build** $\rightarrow$ **Root Directory**: Ubah menjadi `/laravel/server`
   *(Railway akan otomatis menjalankan Dockerfile PHP 8.3 + Nginx yang sudah tersedia)*.
4. Buka tab **Variables** $\rightarrow$ Klik tombol **RAW Editor** $\rightarrow$ Paste:
   ```env
   APP_NAME=Learning Path
   APP_ENV=production
   APP_KEY=base64:a5wOwraabMNcV4syaEwiTRjKIWskybJ0xyRVczkq3ng=
   APP_DEBUG=false
   DB_CONNECTION=pgsql
   DB_HOST=aws-0-ap-southeast-2.pooler.supabase.com
   DB_PORT=6543
   DB_DATABASE=postgres
   DB_USERNAME=postgres.mthqkjcudruvaycbdexm
   DB_PASSWORD=FumihikoAldo
   DB_SSLMODE=require
   DB_URL=postgresql://postgres.mthqkjcudruvaycbdexm:FumihikoAldo@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres
   RUN_MIGRATIONS=true
   GOOGLE_CLIENT_ID=244826909624-055j98h4rd5m8m9ruvami0invr46muof.apps.googleusercontent.com
   ```
5. Buka tab **Networking**:
   * Klik **Generate Domain**
   * Pastikan Port diisi **`8000`**
6. 📌 **Catat URL Laravel Anda**, contoh:
   `https://laravel-server-production-xxxx.up.railway.app`
7. Kembali ke tab **Variables** Laravel, tambahkan 1 variable lagi:
   * `APP_URL` = `https://laravel-server-production-xxxx.up.railway.app`

---

## 4. Langkah 3: Deploy Frontend React + Vite di Vercel

1. Buka [Vercel.com](https://vercel.com) $\rightarrow$ Login via GitHub.
2. Klik **Add New...** $\rightarrow$ **Project** $\rightarrow$ Pilih repo `FInal-Pathclubs-App`.
3. Pada halaman **Configure Project**:
   * **Framework Preset**: `Vite`
   * **Root Directory**: Klik **Edit** dan pilih folder `frontend`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Buka bagian **Environment Variables** $\rightarrow$ Masukkan 3 variabel:

| Key | Value (Ganti dengan domain online Anda) |
|---|---|
| `VITE_API_BASE_URL` | `https://laravel-server-production-xxxx.up.railway.app/api` |
| `VITE_ML_API_URL` | `https://flask-backend-production-xxxx.up.railway.app/api` |
| `VITE_GOOGLE_CLIENT_ID` | `244826909624-055j98h4rd5m8m9ruvami0invr46muof.apps.googleusercontent.com` |

5. Klik tombol **Deploy**.
6. 📌 **Catat URL Frontend Vercel Anda**, contoh:
   `https://learning-path-app.vercel.app`

---

## 5. Langkah 4: Konfigurasi Lengkap Google OAuth Console

Agar fitur **Login with Google** bisa berjalan di domain produksi (bukan hanya di localhost), Anda wajib mendaftarkan domain Vercel ke Google Cloud Console.

### Langkah-langkah:
1. Buka [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials).
2. Pastikan project Google Cloud yang benar sudah terpilih di bagian atas.
3. Di bawah tabel **OAuth 2.0 Client IDs**, klik nama Client ID Anda (contoh: `Web client 1` atau yang memiliki ID `244826909624-055j98h4rd5m8m9ruvami0invr46muof...`).
4. Scroll ke bagian **Authorized JavaScript origins**:
   * Klik **+ ADD URI**
   * Masukkan domain frontend Vercel Anda (TANPA slash di belakang), contoh:
     * `https://learning-path-app.vercel.app`
     * *(Pertahankan juga `http://localhost:5173` untuk testing lokal)*
5. Scroll ke bagian **Authorized redirect URIs**:
   * Klik **+ ADD URI**
   * Masukkan domain frontend Vercel Anda:
     * `https://learning-path-app.vercel.app`
     * `https://learning-path-app.vercel.app/login`
     * *(Pertahankan juga `http://localhost:5173` dan `http://localhost:5173/login`)*
6. Klik tombol **SAVE** di bagian paling bawah.
   *(Perubahan Google OAuth biasanya aktif dalam 1-5 menit)*.

---

## 6. Langkah 5: Pengujian & Troubleshooting

### Checklist Pengujian:
- [ ] **Buka Website**: Akses `https://learning-path-app.vercel.app`
- [ ] **Test Refresh SPA**: Masuk ke halaman `/dashboard` lalu tekan F5 / Refresh (harus tetap terbuka normal, tidak boleh error 404 karena sudah ada `vercel.json`).
- [ ] **Test Google Login**: Klik tombol "Login with Google", pilih akun Google Anda. Pastikan berhasil login dan masuk ke dashboard.
- [ ] **Test Rekomendasi Karir (ML)**: Pilih minat & keahlian, lalu klik Prediksi Karir. Data harus berhasil dihitung oleh Flask Backend.

### Solusi Masalah Umum:
1. **Error Build Railway `Failed to build image (railpack)`**:
   * Penyebab: Root Directory lupa diatur.
   * Solusi: Buka Settings $\rightarrow$ Root Directory $\rightarrow$ isi `/backend` untuk Flask, atau `/laravel/server` untuk Laravel.
2. **Error Google Login `origin_mismatch` (400)**:
   * Penyebab: URL domain Vercel belum ditambahkan ke *Authorized JavaScript origins* di Google Cloud Console.
   * Solusi: Ikuti Langkah 4 di atas dan simpan kembali.
3. **Database Migration di Supabase**:
   * Jika ingin migrasi tabel manual dari lokal ke Supabase:
     ```bash
     cd laravel/server
     php artisan migrate --force
     ```
