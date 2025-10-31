<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CommentRequest extends FormRequest
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
            'content' => [$isUpdate ? 'sometimes' : 'required', 'string', 'min:1'],
            'task_id' => [$isUpdate ? 'sometimes' : 'required', 'integer', 'exists:tasks,id'],
        ];
    }
}
