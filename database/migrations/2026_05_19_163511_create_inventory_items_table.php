<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sku')->unique();
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->integer('quantity_on_hand')->default(0);
            $table->integer('reorder_level')->default(10);
            $table->decimal('unit_price', 10, 2)->default(0);
            $table->decimal('selling_price', 10, 2)->default(0);
            $table->string('supplier')->nullable();
            $table->date('expiry_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
