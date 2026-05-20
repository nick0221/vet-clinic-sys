<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id' => ['required', 'exists:clients,id'],
            'name' => ['required', 'string', 'max:255'],
            'species' => ['required', 'string', 'max:100'],
            'breed' => ['nullable', 'string', 'max:255'],
            'sex' => ['nullable', 'string', 'in:male,female'],
            'date_of_birth' => ['nullable', 'date'],
            'weight' => ['nullable', 'numeric', 'min:0', 'max:99999'],
            'color' => ['nullable', 'string', 'max:100'],
            'microchip_id' => ['nullable', 'string', 'max:100', Rule::unique('pets', 'microchip_id')->ignore($this->route('pet'))],
            'photo' => ['nullable', 'image', 'max:2048'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }
}
