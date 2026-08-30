# 🚀 Backend API - Adaptive Learning Path (Laravel)

Repositori ini berisi REST API Backend menggunakan Laravel yang mengelola autentikasi pengguna dan penyimpanan data kuesioner profil ke database MySQL.

---

## 🛠️ Persyaratan Sistem
* PHP >= 8.1
* Composer
* MySQL / MariaDB (via XAMPP / Laragon / Native)

---

## ⚡ Langkah Quick Start (Instalasi & Menjalankan)

Jalankan perintah berikut secara berurutan di terminal kamu:

```bash
# 1. Clone repositori & masuk ke folder
git clone [https://github.com/RizkyRevaldo/learning_path.git](https://github.com/RizkyRevaldo/learning_path.git)
cd learning_path/server

# 2. Install dependensi PHP
composer install

# 3. Buat file konfigurasi .env
cp .env.example .env

# 4. Generate Application Key
php artisan key:generate

# 5. Jalankan Migration Database
# (Pastikan MySQL sudah menyala dan database 'db_learning_path' sudah dibuat di phpMyAdmin)
php artisan migrate

# 6. Jalankan Server Local Laravel
php artisan serve

Sesuaikan baris berikut pada file .env jika menggunakan nama database, username, atau password MySQL yang berbeda:
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_learning_path
DB_USERNAME=root
DB_PASSWORD=

Endpoint API Utama
POST /api/register - Pendaftaran akun baru (menyimpan ke tabel users).

POST /api/login - Verifikasi autentikasi email & password.

POST /api/profile - Menyimpan hasil kuesioner ke tabel profiles.
