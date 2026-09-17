<?php

namespace App\Http\Requests\Settings;

use App\Concerns\PasswordValidationRules;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ProfileDeleteRequest extends FormRequest
{
    use PasswordValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'password' => $this->currentPasswordRules(),
        ];
    }

    /**
     * Admin accounts are only made from the console, so deleting the last one
     * would leave nobody able to manage accounts from the app.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $user = $this->user();

                if ($user?->is_admin && ! User::query()->where('is_admin', true)->whereKeyNot($user->id)->exists()) {
                    $validator->errors()->add(
                        'password',
                        __('You are the only administrator. Make another administrator before deleting this account.'),
                    );
                }
            },
        ];
    }
}
