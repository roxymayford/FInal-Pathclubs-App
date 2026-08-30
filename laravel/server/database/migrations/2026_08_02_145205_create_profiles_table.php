<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('profiles', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Menghubungkan ke tabel user
        $table->string('jurusan')->nullable();       // Contoh: Informatika
        $table->integer('semester')->nullable();      // Contoh: 3
        $table->string('peminatan')->nullable();     // Contoh: Web Development
        $table->string('level_kemampuan')->nullable(); // Contoh: Beginner
        $table->timestamps();
    });
}
};
