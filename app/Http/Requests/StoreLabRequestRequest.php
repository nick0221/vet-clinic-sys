<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLabRequestRequest extends FormRequest
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
            'lab_test_id' => ['required', 'exists:lab_tests,id'],
            'request_date' => ['required', 'date'],
            'status' => ['required', 'in:pending,collected,in_progress,completed,cancelled'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
