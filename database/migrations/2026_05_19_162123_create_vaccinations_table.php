<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vaccinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_id')->constrained()->cascadeOnDelete();
            $table->foreignId('veterinarian_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('medical_record_id')->nullable()->constrained()->nullOnDelete();
            $table->string('vaccine_name');
            $table->string('manufacturer')->nullable();
            $table->string('batch_number')->nullable();
            $table->date('date_administered');
            $table->date('next_due_date')->nullable();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vaccinations');
    }
};
