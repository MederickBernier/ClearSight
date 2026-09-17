<?php

namespace App\Concerns;

use App\Models\ItemLink;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * The shared half of App\Contracts\Linkable: the two morph relations every
 * linkable module resolves the same way. The labelling methods stay on each
 * model, since only the model knows what it is called.
 */
trait HasItemLinks
{
    /**
     * The link table's morph columns carry no foreign key, so nothing in the
     * database removes a link when either end is deleted. Left behind, those
     * rows keep counting in the metrics and point at pages that 404.
     */
    public static function bootHasItemLinks(): void
    {
        static::deleting(function (self $record): void {
            $record->outgoingItemLinks()->delete();
            $record->incomingItemLinks()->delete();
        });
    }

    /**
     * @return MorphMany<ItemLink, $this>
     */
    public function outgoingItemLinks(): MorphMany
    {
        return $this->morphMany(ItemLink::class, 'source');
    }

    /**
     * @return MorphMany<ItemLink, $this>
     */
    public function incomingItemLinks(): MorphMany
    {
        return $this->morphMany(ItemLink::class, 'target');
    }
}
