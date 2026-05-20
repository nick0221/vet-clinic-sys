<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVaccinationRequest extends FormRequest
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
            'vaccine_name' => ['required', 'string', 'max:255'],
            'manufacturer' => ['nullable', 'string', 'max:255'],
            'batch_number' => ['nullable', 'string', 'max:100'],
            'date_administered' => ['required', 'date'],
            'next_due_date' => ['nullable', 'date', 'after_or_equal:date_administered'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
