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
            'participants' => [$isUpdate ? 'nullable' : 'required', 'array', 'min:1'],
            'participants.*.user_id' => ['required', 'integer', 'exists:users,id'],
            'participants.*.role' => ['required', 'string', 'in:creator,executor,observer'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $isUpdate = $this->route()?->getActionMethod() === 'update';
            
            if (!$isUpdate && $this->has('participants')) {
                // При создании должен быть хотя бы один creator
                $hasCreator = false;
                foreach ($this->input('participants', []) as $participant) {
                    if (isset($participant['role']) && $participant['role'] === 'creator') {
                        $hasCreator = true;
                        break;
                    }
                }
                
                if (!$hasCreator) {
                    $validator->errors()->add('participants', 'Должен быть указан хотя бы один участник с ролью creator');
                }
            }
        });
    }
}
