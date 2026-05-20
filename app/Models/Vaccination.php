<?php

namespace App\Models;

use Database\Factories\VaccinationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vaccination extends Model
{
    /** @use HasFactory<VaccinationFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'pet_id',
        'veterinarian_id',
        'medical_record_id',
        'vaccine_name',
        'manufacturer',
        'batch_number',
        'date_administered',
        'next_due_date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_administered' => 'date',
            'next_due_date' => 'date',
        ];
    }

    public function pet(): BelongsTo
    {
        return $this->belongsTo(Pet::class);
    }

    public function veterinarian(): BelongsTo
    {
        return $this->belongsTo(User::class, 'veterinarian_id');
    }

    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    public function activity(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }
}
