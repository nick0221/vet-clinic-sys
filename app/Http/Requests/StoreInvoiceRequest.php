<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id' => ['required', 'exists:clients,id'],
            'invoice_number' => ['required', 'string', 'max:255', 'unique:invoices,invoice_number'],
            'pet_id' => ['required', 'exists:pets,id'],
            'appointment_id' => ['nullable', 'exists:appointments,id'],
            'veterinarian_id' => ['required', 'exists:users,id'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'tax' => ['required', 'numeric', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'in:draft,pending,paid,overdue,cancelled,refunded'],
            'due_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
