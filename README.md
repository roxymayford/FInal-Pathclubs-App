# Learning Path App

Platform pembelajaran cerdas berbasis AI yang memberikan rekomendasi jalur karir dan memantau perkembangan belajar pengguna.

## Arsitektur Proyek

Proyek ini menggunakan arsitektur *monorepo* yang terdiri dari 3 bagian utama:

### 1. Frontend (React + Vite)
Berada di folder `frontend/`. Menangani antarmuka pengguna, termasuk fitur autentikasi, dashboard, dan integrasi dengan backend.
- **Teknologi**: React 19, Vite, TailwindCSS, React Router.
- **Port**: `http://localhost:5173`

### 2. Machine Learning API (Flask)
Berada di folder `backend/`. Menangani logika Machine Learning untuk memprediksi rekomendasi jalur karir berdasarkan minat dan keahlian menggunakan model berbasis `scikit-learn`.
- **Teknologi**: Python, Flask, scikit-learn, joblib.
- **Port**: `http://127.0.0.1:5000`

### 3. Authentication & Main API (Laravel)
Berada di folder `laravel/` (dan `learning_path_server/`). Menangani logika otentikasi utama menggunakan *Google OAuth* (Laravel Socialite) dan manajemen database pengguna dengan Laravel Sanctum.
- **Teknologi**: PHP, Laravel 11, MySQL, Laravel Sanctum, Laravel Socialite.
- **Port**: `http://127.0.0.1:8000`

## Cara Menjalankan Aplikasi

Berikut adalah langkah-langkah untuk menyiapkan dan menjalankan ketiga bagian aplikasi secara lengkap di lingkungan lokal Anda.

### 1. Persiapan API Utama (Laravel)
Pastikan Anda memiliki PHP (>= 8.1), Composer, dan MySQL (XAMPP/Laragon) yang sudah berjalan.

```bash
# Masuk ke direktori server Laravel
cd laravel/server

# Install dependensi PHP
composer install

# Salin file konfigurasi environment
cp .env.example .env

# Generate Application Key
php artisan key:generate
```

**Konfigurasi Database**:
Buka file `laravel/server/.env` dan ubah konfigurasi database Anda. Buat database baru di MySQL (contoh: `db_learning_path`) sebelum menjalankan migrasi.
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_learning_path
DB_USERNAME=root
DB_PASSWORD=
```

Kemudian, jalankan migrasi dan hidupkan server:
```bash
# Jalankan migrasi database
php artisan migrate

# Jalankan server lokal Laravel
php artisan serve
```
*(Server Laravel akan berjalan di `http://127.0.0.1:8000`)*

### 2. Persiapan ML Backend (Flask)
Pastikan Anda memiliki Python terinstal. Buka terminal baru:

```bash
# Masuk ke direktori backend
cd backend

# (Opsional) Buat dan jalankan virtual environment
# python -m venv venv
# venv\Scripts\activate   (Windows)
# source venv/bin/activate (Mac/Linux)

# Install dependensi Python
pip install -r requirements.txt

# Salin file konfigurasi environment
cp .env.example .env

# Jalankan server Flask
python app.py
```
*(Server Flask akan berjalan di `http://127.0.0.1:5000`)*

### 3. Persiapan Frontend (React)
Pastikan Anda memiliki Node.js terinstal. Buka terminal baru lagi:

```bash
# Masuk ke direktori frontend
cd frontend

# Install dependensi NPM
npm install

# Salin file konfigurasi environment
cp .env.example .env

# Jalankan server pengembangan Vite
npm run dev
```
*(Frontend akan berjalan di `http://localhost:5173`)*

## Fitur Utama
- **Autentikasi Cepat**: Mendukung Login via Google.
- **Rekomendasi Karir AI**: Mengolah input *skills* & *interests* pengguna lalu memprediksi 5 besar bidang pekerjaan yang paling cocok dengan persentase kesesuaian (menggunakan *Machine Learning*).
- **Gamifikasi**: Notifikasi pencapaian (badge) dan monitoring progress belajar.
