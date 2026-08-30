# Google OAuth + Database Auth + Post-SignUp Career Recommendation Flow

## Ringkasan

Sistem ini akan mengintegrasikan login Google (OAuth 2.0) ke dalam aplikasi yang sudah ada (React + Vite frontend, Flask backend), menghubungkannya ke database MySQL via Laravel backend yang sudah ada, dan mengganti halaman `/assessment` post-signup dengan alur **Rekomendasi Karir** yang bisa di-skip.

## Arsitektur Sistem

```
Frontend (React/Vite)
    ↕ Google OAuth (Firebase Auth / @react-oauth/google)
    ↕ HTTP API
Backend Flask (Python) ← model ML pkl
    ↕ HTTP API
Backend Laravel (PHP) ← MySQL database
```

## User Review Required

> [!IMPORTANT]
> **Pilihan Provider Google OAuth**: Ada 2 opsi implementasi:
> 1. **Firebase Authentication** — Google sign-in via Firebase SDK (lebih mudah, perlu Firebase project)
> 2. **`@react-oauth/google`** — Google Identity Services langsung (cukup Google Cloud Console Client ID)
>
> **Rekomendasi**: Opsi 2 (`@react-oauth/google`) karena lebih ringan dan tidak perlu Firebase project baru — hanya butuh **Google Client ID** dari Google Cloud Console.

> [!IMPORTANT]
> **Laravel Backend**: Kamu perlu memiliki Laravel backend running di `http://127.0.0.1:8000`. Plan ini akan menambahkan endpoint:
> - `POST /api/auth/google` — menerima Google token, buat/cari user di DB
> - `POST /api/career-recommendation/save` — simpan hasil rekomendasi karir
> - `GET /api/career-recommendation/{user_id}` — ambil rekomendasi tersimpan

> [!WARNING]
> **Google Client ID diperlukan**: Kamu harus menyediakan Google OAuth Client ID dari [Google Cloud Console](https://console.cloud.google.com/). Tanpa ini, Google Login tidak bisa berfungsi.

## Open Questions

> [!IMPORTANT]
> **Apakah Laravel backend sudah ada/berjalan?** Plan ini berasumsi ada Laravel di port 8000. Jika belum, perlu setup Laravel terpisah.

## Proposed Changes

---

### Frontend — Google OAuth Integration

#### [MODIFY] [package.json](file:///c:/Users/SANRIO/Downloads/Learning%20Path%20A/frontend/package.json)
Tambah dependency `@react-oauth/google` untuk Google Identity Services.

---

### Frontend — Auth & Routing

#### [MODIFY] [AuthContext.jsx](file:///c:/Users/SANRIO/Downloads/Learning Path A/frontend/src/context/AuthContext.jsx)
- Tambah fungsi `loginWithGoogle(googleToken)` yang hit ke endpoint Laravel `POST /api/auth/google`
- Simpan token JWT Laravel ke localStorage
- Handle Google user state (nama, email, avatar dari Google)

#### [MODIFY] [Login.jsx](file:///c:/Users/SANRIO/Downloads/Learning Path A/frontend/src/pages/Login.jsx)
- Ganti tombol "Log in with Google" (yang saat ini dummy) dengan Google OAuth button dari `@react-oauth/google`
- Setelah login Google sukses → navigate ke `/dashboard`

#### [MODIFY] [Register.jsx](file:///c:/Users/SANRIO/Downloads/Learning Path A/frontend/src/pages/Register.jsx)
- Tambah tombol "Sign up with Google"
- Setelah register via Google → navigate ke `/career-onboarding` (bukan `/assessment`)
- Setelah register biasa → navigate ke `/career-onboarding` (bukan `/assessment`)

#### [MODIFY] [App.jsx](file:///c:/Users/SANRIO/Downloads/Learning Path A/frontend/src/App.jsx)
- Wrap dengan `GoogleOAuthProvider`
- Tambah route `/career-onboarding` → `CareerOnboarding` component

---

### Frontend — Career Onboarding (Post-SignUp)

#### [NEW] `frontend/src/pages/CareerOnboarding.jsx`
Halaman onboarding pasca sign-up dengan:
- **Langkah tunggal**: Pilih skills & interests (mirip Rekomendasi.jsx tapi dalam layout onboarding)
- **Tombol "Dapatkan Rekomendasi"** → hit Flask ML API → tampilkan hasil
- **Tombol "Skip untuk sekarang"** → langsung ke `/dashboard`
- **Tombol "Simpan & Lanjutkan"** setelah dapat hasil → simpan ke backend → ke `/dashboard`
- Data rekomendasi disimpan via `POST /api/career-recommendation/save` ke Laravel

---

### Backend Flask — Simpan Rekomendasi

#### [MODIFY] [app.py](file:///c:/Users/SANRIO/Downloads/Learning Path A/backend/app.py)
- Tambah endpoint `POST /api/save-recommendation` — relay ke Laravel untuk simpan data rekomendasi karir user
- Atau simpan langsung ke file JSON lokal sebagai fallback

---

### Backend Laravel — Endpoint Baru

Perlu ditambahkan di Laravel (kode disiapkan, tapi perlu diapply ke Laravel project):

#### `routes/api.php` 
```php
Route::post('/auth/google', [AuthController::class, 'loginWithGoogle']);
Route::post('/career-recommendation/save', [CareerController::class, 'save']);
Route::get('/career-recommendation/{user_id}', [CareerController::class, 'show']);
```

#### Migration: `career_recommendations` table
```
id, user_id, top_career, skills (json), interests (json), probabilities (json), created_at, updated_at
```

---

## Alur Lengkap

```
Login/Register
    ├── Email + Password → Laravel API → localStorage(user_id) → /career-onboarding
    └── Google OAuth → Google token → Laravel /api/auth/google → localStorage(user_id, token) → /career-onboarding (jika baru) atau /dashboard (jika sudah pernah login)

Career Onboarding (/career-onboarding)
    ├── Pilih Skills & Interests → Flask /api/predict → Tampilkan hasil
    ├── "Simpan & Lanjutkan" → Laravel /api/career-recommendation/save → /dashboard
    └── "Skip" → /dashboard
```

## Verification Plan

### Automated Tests
- Tidak ada (manual testing)

### Manual Verification
1. Klik "Log in with Google" → Google popup muncul → berhasil login
2. Register baru → diarahkan ke `/career-onboarding`
3. Pilih skills/interests → klik "Dapatkan Rekomendasi" → tampil hasil
4. Klik "Simpan" → data tersimpan di DB → redirect ke dashboard
5. Klik "Skip" → langsung ke dashboard
6. Login ulang → data rekomendasi tersimpan bisa dilihat di profil
