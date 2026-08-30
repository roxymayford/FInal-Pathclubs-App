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
            $mlResponse = Http::timeout(3)->post('http://127.0.0.1:5000/predict', [
                'jurusan' => $request->jurusan,
                'semester' => $request->semester,
                'peminatan' => $request->peminatan,
                'level_kemampuan' => $request->level_kemampuan,
            ]);

            $hasilAI = $mlResponse->successful() ? $mlResponse->json() : [
                'status' => 'warning',
                'rekomendasi' => $request->peminatan
            ];
        } catch (\Exception $e) {
            $hasilAI = [
                'status' => 'offline',
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