<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVeterinarianRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:20'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'license_number' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
            'emergency_contact' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
