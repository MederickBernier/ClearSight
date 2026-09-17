<?php

namespace App\Models;

use App\Concerns\HasItemLinks;
use App\Contracts\Linkable;
use App\Enums\TriageStatus;
use Carbon\CarbonImmutable;
use Database\Factories\RadarItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int|null $feed_source_id
 * @property string $title
 * @property string $url
 * @property string|null $summary
 * @property CarbonImmutable|null $published_at
 * @property CarbonImmutable $fetched_at
 * @property TriageStatus $triage_status
 * @property CarbonImmutable|null $triaged_at
 * @property string|null $relevance_note
 * @property bool $is_hidden
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read FeedSource|null $feedSource the source is nullable: a feed can be
 *     removed without taking the items it produced with it
 */
#[Fillable([
    'feed_source_id',
    'title',
    'url',
    'summary',
    'published_at',
    'triage_status',
    'relevance_note',
])]
class RadarItem extends Model implements Linkable
{
    /** @use HasFactory<RadarItemFactory> */
    use HasFactory;

    use HasItemLinks;
    use MassPrunable;

    /**
     * @return array<string,string>
     */
    protected function casts(): array
    {
        return [
            'triage_status' => TriageStatus::class,
            'published_at' => 'immutable_datetime',
            'fetched_at' => 'immutable_datetime',
            'triaged_at' => 'immutable_datetime',
            'is_hidden' => 'boolean',
        ];
    }

    /**
     * Triage is what makes an item worth keeping, so the dates and the
     * discarded flag follow the status rather than each caller setting them.
     *
     * Discarding hides an item instead of deleting it: the spec's "discard,
     * not archive" principle still needs the row for dedup on the next fetch,
     * and a too-hasty dismissal stays recoverable.
     */
    protected static function booted(): void
    {
        static::creating(function (self $item): void {
            $item->fetched_at ??= now();
        });

        static::saving(function (self $item): void {
            // The note says why an item is relevant, so it goes when it is not.
            if ($item->triage_status !== TriageStatus::Relevant) {
                $item->relevance_note = null;
            }

            if ($item->triage_status === TriageStatus::Pending) {
                $item->triaged_at = null;
                $item->is_hidden = false;

                return;
            }

            // Stamped on every change of call, so it records when the item was
            // last judged rather than when it was first looked at.
            if ($item->triaged_at === null || $item->isDirty('triage_status')) {
                $item->triaged_at = now();
            }

            $item->is_hidden = $item->triage_status === TriageStatus::Discarded;
        });
    }

    /**
     * Discarded items the feeds have long since moved on from.
     *
     * A discarded row is kept at first because its url is what stops the next
     * fetch from resurfacing it; a year on, no feed still lists it. Anything
     * linked to other work is history and stays.
     *
     * @return Builder<RadarItem>
     */
    public function prunable(): Builder
    {
        return self::query()
            ->where('triage_status', TriageStatus::Discarded)
            ->where('fetched_at', '<', now()->subYear())
            ->whereDoesntHave('outgoingItemLinks')
            ->whereDoesntHave('incomingItemLinks');
    }

    /**
     * Items that have not been dismissed.
     *
     * @param  Builder<RadarItem>  $query
     */
    public function scopeVisible(Builder $query): void
    {
        $query->where('is_hidden', false);
    }

    /**
     * @return BelongsTo<FeedSource, $this>
     */
    public function feedSource(): BelongsTo
    {
        return $this->belongsTo(FeedSource::class);
    }

    public function linkLabel(): string
    {
        return $this->title;
    }

    public function linkUrl(): string
    {
        return route('radar.show', $this);
    }

    public static function moduleLabel(): string
    {
        return 'Radar item';
    }
}
