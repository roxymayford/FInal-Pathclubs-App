<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;

    // Masukkan semua field kuesioner ke $fillable
    protected $fillable = [
        'user_id',
        'jurusan',
        'semester',
        'peminatan',
        'level_kemampuan'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}