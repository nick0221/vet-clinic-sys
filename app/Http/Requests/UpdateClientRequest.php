<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClientRequest extends FormRequest
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
                Rule::unique('clients', 'name')->ignore($this->route('client'))->where(function ($query) {
                    $query->where('email', $this->email)
                        ->orWhere('phone', $this->phone);
                }),
            ],
            'email' => ['required', 'email', 'max:255', Rule::unique('clients', 'email')->ignore($this->route('client'))],
            'phone' => ['required', 'string', 'max:50', Rule::unique('clients', 'phone')->ignore($this->route('client'))],
            'address' => ['nullable', 'string'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }
}
