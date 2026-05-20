<?php

namespace App\Models;

use Database\Factories\InventoryItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItem extends Model
{
    /** @use HasFactory<InventoryItemFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'sku',
        'category',
        'description',
        'quantity_on_hand',
        'reorder_level',
        'unit_price',
        'selling_price',
        'supplier',
        'expiry_date',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
            'is_active' => 'boolean',
            'expiry_date' => 'date',
        ];
    }

    public function lowStock(): bool
    {
        return $this->quantity_on_hand <= $this->reorder_level;
    }

    public function activity(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }
}
