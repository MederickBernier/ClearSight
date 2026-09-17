<?php

namespace App\Http\Requests\Radar;

use App\Actions\ResolvePublicAddress;
use App\Enums\FeedType;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreFeedSourceRequest extends FormRequest
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
     * The app fetches this URL itself, so the scheme is pinned to http/https
     * rather than accepting anything the url rule would allow.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'url' => [
                'required',
                'url:http,https',
                'max:255',
                function (string $attribute, mixed $value, Closure $fail): void {
                    if (is_string($value) && app(ResolvePublicAddress::class)($value) === null) {
                        $fail(__('Use a public web address; private and internal addresses cannot be fetched.'));
                    }
                },
                Rule::unique('feed_sources', 'url')->ignore($this->route('feedSource')),
            ],
            'feed_type' => ['required', new Enum(FeedType::class)],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
