<?php

namespace App\Concerns;

use App\Enums\VettingSourceType;
use App\Enums\VettingStatus;
use Illuminate\Validation\Rules\Enum;

trait VettingItemValidationRules
{
    /**
     * @return array<string,mixed>
     */
    protected function vettingItemRules(): array
    {
        return [
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'title' => ['required', 'string', 'max:255'],
            'source_type' => ['required', new Enum(VettingSourceType::class)],
            'source_detail' => ['nullable', 'string', 'max:255'],
            // Recorded after the fact, never ahead of it: a future date here
            // turns into a negative time-to-resolve in the metrics.
            'date_raised' => ['required', 'date', 'before_or_equal:'.now(config()->string('app.display_timezone'))->toDateString()],
            'proposal_description' => ['required', 'string'],
            'assessment' => ['nullable', 'string'],
            'status' => ['required', new Enum(VettingStatus::class)],
            'rejection_reason' => [
                'nullable',
                'required_if:status,'.VettingStatus::Rejected->value,
                'string',
            ],
            'external_url' => ['nullable', 'url:http,https', 'max:255'],
        ];
    }

    /**
     * @return array<string,string>
     */
    protected function vettingItemMessages(): array
    {
        return [
            'rejection_reason.required_if' => __('A rejected item needs a rejection reason.'),
        ];
    }
}
