<?php

namespace App\Models;

use Database\Factories\MedicalRecordFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MedicalRecord extends Model
{
    /** @use HasFactory<MedicalRecordFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'pet_id',
        'veterinarian_id',
        'appointment_id',
        'visit_date',
        'subjective',
        'objective',
        'assessment',
        'plan',
        'notes',
        'temperature',
        'heart_rate',
        'respiratory_rate',
        'weight',
    ];

    protected function casts(): array
    {
        return [
            'visit_date' => 'date',
            'temperature' => 'decimal:2',
            'weight' => 'decimal:2',
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

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function vaccinations(): HasMany
    {
        return $this->hasMany(Vaccination::class);
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    public function activity(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }
}
