<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->foreignId('veterinarian_id')->constrained('users')->cascadeOnDelete();
            $table->dateTime('date_time');
            $table->string('status')->default('scheduled');
            $table->text('reason');
            $table->text('notes')->nullable();
            $table->integer('duration')->default(30);
            $table->string('type')->default('checkup');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
