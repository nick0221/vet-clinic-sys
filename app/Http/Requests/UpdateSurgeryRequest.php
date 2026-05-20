<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSurgeryRequest extends FormRequest
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
            'surgery_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'scheduled_date' => ['required', 'date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'status' => ['required', 'in:scheduled,in_progress,completed,cancelled'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
