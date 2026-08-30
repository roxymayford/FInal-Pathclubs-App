<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ProfileController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'jurusan' => 'required|string',
            'semester' => 'required|integer',
            'peminatan' => 'required|string',
            'level_kemampuan' => 'required|string',
        ]);

        // Ambil user_id dinamis dari localStorage Frontend
        $userId = $request->input('user_id', 1);

        $profile = Profile::updateOrCreate(
            ['user_id' => $userId],
            $validated
        );

        try {
            $mlBaseUrl = env('ML_API_URL', 'http://127.0.0.1:5000/api');
            $skillsMap = [
                'Matematika' => ['Python', 'Data Analysis', 'SQL'],
                'IPA / Sains' => ['Python', 'Machine Learning', 'Data Analysis'],
                'IPS / Sosial' => ['Product Management', 'Data Analysis', 'SQL'],
                'Bahasa Indonesia' => ['UI/UX Design', 'Product Management', 'React'],
            ];
            $interestsMap = [
                'Visual (Video/Animasi)' => ['UI/UX Design', 'Design'],
                'Auditori (Penjelasan/Podcast)' => ['Product Management', 'Web Development'],
                'Baca-Tulis (Catatan/Ringkasan)' => ['Data Science', 'Artificial Intelligence'],
                'Kinestetik (Praktik/Latihan)' => ['Web Development', 'Software Development'],
            ];

            $selectedSkills = $skillsMap[$request->jurusan] ?? ['Python', 'SQL', 'Data Analysis'];
            $selectedInterests = $interestsMap[$request->peminatan] ?? ['Software Development', 'Web Development'];

            $mlResponse = Http::timeout(4)->post(rtrim($mlBaseUrl, '/') . '/predict', [
                'skills' => $selectedSkills,
                'interests' => $selectedInterests,
            ]);

            $hasilAI = $mlResponse->successful() ? $mlResponse->json() : [
                'status' => 'warning',
                'prediction' => $request->peminatan,
                'rekomendasi' => $request->peminatan
            ];
        } catch (\Exception $e) {
            $hasilAI = [
                'status' => 'offline',
                'prediction' => $request->peminatan,
                'rekomendasi' => $request->peminatan
            ];
        }

        return response()->json([
            'message' => 'Profil berhasil disimpan!',
            'data' => $profile,
            'rekomendasi_ml' => $hasilAI
        ], 200);
    }
}