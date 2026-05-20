<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pet_id' => ['required', 'exists:pets,id'],
            'client_id' => ['required', 'exists:clients,id'],
            'veterinarian_id' => ['required', 'exists:users,id'],
            'date_time' => ['required', 'date'],
            'status' => ['required', 'string', 'in:scheduled,confirmed,in_progress,completed,cancelled,no_show'],
            'reason' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
            'duration' => ['required', 'integer', 'min:15', 'max:480'],
            'type' => ['required', 'string', 'in:checkup,vaccination,surgery,follow_up,emergency,dental,grooming,other'],
        ];
    }
}
