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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('specialization')->nullable()->after('phone');
            $table->string('license_number')->nullable()->after('specialization');
            $table->text('bio')->nullable()->after('license_number');
            $table->text('address')->nullable()->after('bio');
            $table->string('emergency_contact')->nullable()->after('address');
            $table->date('start_date')->nullable()->after('emergency_contact');
            $table->text('notes')->nullable()->after('start_date');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'specialization', 'license_number', 'bio', 'address', 'emergency_contact', 'start_date', 'notes']);
        });
    }
};
