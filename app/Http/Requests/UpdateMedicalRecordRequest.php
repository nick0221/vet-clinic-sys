<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMedicalRecordRequest extends FormRequest
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
            'appointment_id' => ['nullable', 'exists:appointments,id'],
            'visit_date' => ['required', 'date'],
            'subjective' => ['nullable', 'string'],
            'objective' => ['nullable', 'string'],
            'assessment' => ['nullable', 'string'],
            'plan' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'temperature' => ['nullable', 'numeric', 'min:30', 'max:45'],
            'heart_rate' => ['nullable', 'integer', 'min:20', 'max:300'],
            'respiratory_rate' => ['nullable', 'integer', 'min:5', 'max:200'],
            'weight' => ['nullable', 'numeric', 'min:0', 'max:99999'],
        ];
    }
}
