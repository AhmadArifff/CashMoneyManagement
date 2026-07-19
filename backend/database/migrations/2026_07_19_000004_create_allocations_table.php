<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('category', ['darurat', 'asuransi', 'investasi', 'cadangan']);
            $table->string('subcategory');
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->text('note')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('allocations');
    }
};
