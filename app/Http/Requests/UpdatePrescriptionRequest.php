<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePrescriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pet_id' => ['required', 'exists:pets,id'],
            'veterinarian_id' => ['required', 'exists:users,id'],
            'medical_record_id' => ['nullable', 'exists:medical_records,id'],
            'medication_name' => ['required', 'string', 'max:255'],
            'dosage' => ['required', 'string', 'max:100'],
            'frequency' => ['required', 'string', 'max:100'],
            'route' => ['nullable', 'string', 'max:100'],
            'duration' => ['nullable', 'string', 'max:100'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            'refills' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ];
    }
}
