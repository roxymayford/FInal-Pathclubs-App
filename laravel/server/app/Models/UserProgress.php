<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProgress extends Model
{
    use HasFactory;

    protected  = [
        'user_id',
        'completed_modules',
        'completed_quizzes',
        'quiz_xp',
        'daily_target',
        'preferences',
        'unlocked_badges',
        'last_login_date',
        'stats',
        'notifications',
    ];

    protected  = [
        'completed_modules'  => 'array',
        'completed_quizzes'  => 'array',
        'daily_target'       => 'array',
        'preferences'        => 'array',
        'unlocked_badges'    => 'array',
        'stats'              => 'array',
        'notifications'      => 'array',
    ];

    public function user()
    {
        return ->belongsTo(User::class);
    }
}
