<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('category', ['tetap', 'berkala', 'dinamis']);
            $table->string('subcategory');
            $table->string('frequency')->nullable();
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->enum('status', ['paid', 'unpaid'])->default('unpaid');
            $table->boolean('is_estimate')->default(false);
            $table->text('note')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'category', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
