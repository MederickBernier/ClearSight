<?php

namespace App\Http\Requests\Projects;

use App\Models\DecisionRecord;
use App\Models\Project;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreProjectRequest extends FormRequest
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'prefix' => [
                'required',
                'string',
                'max:16',
                'regex:/^[A-Z0-9]+$/',
                Rule::unique('projects', 'prefix')->ignore($this->route('project')),
            ],
            'description' => ['nullable', 'string'],
        ];
    }

    /**
     * Renaming a prefix re-stamps every decision filed under the project. If a
     * decision outside it already holds one of the resulting ids, the rename
     * would break the unique index halfway, so it is refused up front.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $project = $this->route('project');

                if (! $project instanceof Project || $validator->errors()->has('prefix') || $project->prefix === $this->input('prefix')) {
                    return;
                }

                $clash = DecisionRecord::query()
                    ->where('project_prefix', $this->input('prefix'))
                    ->where(fn ($query) => $query->whereNull('project_id')->orWhere('project_id', '!=', $project->id))
                    ->whereIn(
                        DB::raw("category || '-' || sequence"),
                        $project->decisionRecords()->selectRaw("category || '-' || sequence"),
                    )
                    ->exists();

                if ($clash) {
                    $validator->errors()->add('prefix', __('Decisions outside this project already use that prefix with the same numbers.'));
                }
            },
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'prefix.regex' => __('A prefix is upper case letters and digits, e.g. VNG.'),
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('prefix')) {
            $this->merge(['prefix' => strtoupper(trim((string) $this->input('prefix')))]);
        }
    }
}
