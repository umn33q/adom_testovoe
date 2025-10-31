<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class TaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isUpdate = $this->route()?->getActionMethod() === 'update';

        return [
            'title' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:255'],
            'description' => [$isUpdate ? 'sometimes' : 'required', 'string'],
            'status' => [$isUpdate ? 'sometimes' : 'required', 'string', 'in:published,in-progress,done,canceled'],
            'due_date' => ['nullable', 'date'],
            'creator_id' => [$isUpdate ? 'sometimes' : 'required', 'integer', 'exists:users,id'],
            'executor_id' => ['nullable', 'integer', 'exists:users,id'],
            'participants' => ['nullable', 'array'],
            'participants.*.user_id' => ['required', 'integer', 'exists:users,id'],
            'participants.*.role' => ['required', 'string', 'in:creator,executor,observer'],
        ];
    }
}
