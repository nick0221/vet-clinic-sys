<?php

namespace App\Models;

use Database\Factories\LabRequestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class LabRequest extends Model
{
    /** @use HasFactory<LabRequestFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'pet_id',
        'veterinarian_id',
        'appointment_id',
        'lab_test_id',
        'request_date',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'request_date' => 'date',
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

    public function labTest()
    {
        return $this->belongsTo(LabTest::class);
    }

    public function results()
    {
        return $this->hasMany(LabResult::class);
    }

    public function activity(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }
}
