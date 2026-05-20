<?php

namespace App\Models;

use Database\Factories\PetFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pet extends Model
{
    /** @use HasFactory<PetFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'client_id',
        'name',
        'species',
        'breed',
        'sex',
        'date_of_birth',
        'weight',
        'color',
        'microchip_id',
        'photo',
        'notes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'weight' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function activity(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }
}
