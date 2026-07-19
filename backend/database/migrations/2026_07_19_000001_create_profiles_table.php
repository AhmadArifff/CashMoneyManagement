<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('phone_number')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['pria', 'wanita', 'lainnya'])->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->string('avatar_path')->nullable();
            $table->string('job_title')->nullable();
            $table->string('company_name')->nullable();
            $table->enum('employment_type', ['karyawan', 'wirausaha', 'freelance', 'pelajar', 'lainnya'])->nullable();
            $table->decimal('monthly_income_estimate', 15, 2)->nullable();
            $table->string('currency', 5)->default('IDR');
            $table->string('timezone')->default('Asia/Jakarta');
            $table->json('notification_preferences')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
