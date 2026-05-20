<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class LabResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'lab_request_id',
        'parameter',
        'value',
        'reference_range',
        'notes',
    ];

    public function labRequest()
    {
        return $this->belongsTo(LabRequest::class);
    }

    public function activity(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }
}
