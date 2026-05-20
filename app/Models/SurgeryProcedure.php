<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class SurgeryProcedure extends Model
{
    use HasFactory;

    protected $fillable = [
        'surgery_id',
        'procedure_name',
        'description',
        'notes',
    ];

    public function surgery()
    {
        return $this->belongsTo(Surgery::class);
    }

    public function activity(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }
}
