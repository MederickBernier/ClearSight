<?php

namespace App\Concerns;

use App\Models\TechnologyUsage;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * Marks a record as something that can be built from technologies.
 */
trait HasTechnologies
{
    /**
     * Usages are a morph relation with no foreign key to cascade, so they go
     * with the record here rather than lingering in the technology counts.
     */
    public static function bootHasTechnologies(): void
    {
        static::deleting(function (self $record): void {
            $record->technologyUsages()->delete();
        });
    }

    /**
     * @return MorphMany<TechnologyUsage, $this>
     */
    public function technologyUsages(): MorphMany
    {
        return $this->morphMany(TechnologyUsage::class, 'usable');
    }
}
