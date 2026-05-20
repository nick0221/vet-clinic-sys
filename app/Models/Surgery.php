<?php

namespace App\Models;

use Database\Factories\SurgeryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Surgery extends Model
{
    /** @use HasFactory<SurgeryFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'pet_id',
        'veterinarian_id',
        'appointment_id',
        'surgery_name',
        'description',
        'scheduled_date',
        'start_time',
        'end_time',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date',
        ];
    }

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    public function veterinarian()
    {
        return $this->belongsTo(User::class, 'veterinarian_id');
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function procedures()
    {
        return $this->hasMany(SurgeryProcedure::class);
    }

    public function activity(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }
}
