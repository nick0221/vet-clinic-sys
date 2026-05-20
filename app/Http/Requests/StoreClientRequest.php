<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('clients', 'name')->where(function ($query) {
                    $query->where('email', $this->email)
                        ->orWhere('phone', $this->phone);
                }),
            ],
            'email' => ['required', 'email', 'max:255', 'unique:clients,email'],
            'phone' => ['required', 'string', 'max:50', 'unique:clients,phone'],
            'address' => ['nullable', 'string'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }
}
