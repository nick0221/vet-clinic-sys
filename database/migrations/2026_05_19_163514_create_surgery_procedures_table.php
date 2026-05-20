<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('surgery_procedures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('surgery_id')->constrained('surgeries')->cascadeOnDelete();
            $table->string('procedure_name');
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('surgery_procedures');
    }
};
