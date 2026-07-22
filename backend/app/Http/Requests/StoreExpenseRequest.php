<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => ['required', 'in:tetap,berkala,dinamis'],
            'subcategory' => ['required', 'string', 'max:255'],
            'frequency' => ['nullable', 'string', 'max:50'],
            'amount' => ['required', 'numeric', 'min:0'],
            'date' => ['required', 'date'],
            'status' => ['nullable', 'in:paid,unpaid'],
            'is_estimate' => ['nullable', 'boolean'],
            'note' => ['nullable', 'string'],
            'attachment' => ['nullable', 'file', 'mimes:jpeg,png,jpg,webp,pdf', 'max:10240'],
        ];
    }
}
