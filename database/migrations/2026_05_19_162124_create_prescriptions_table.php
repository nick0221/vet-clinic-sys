<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_id')->constrained()->cascadeOnDelete();
            $table->foreignId('veterinarian_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('medical_record_id')->nullable()->constrained()->nullOnDelete();
            $table->string('medication_name');
            $table->string('dosage');
            $table->string('frequency');
            $table->string('route')->nullable();
            $table->string('duration')->nullable();
            $table->integer('quantity')->nullable();
            $table->integer('refills')->nullable()->default(0);
            $table->text('notes')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
