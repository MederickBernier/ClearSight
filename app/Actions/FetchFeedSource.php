<?php

namespace App\Actions;

use App\Models\FeedSource;
use App\Models\RadarItem;
use Exception;
use GuzzleHttp\Psr7\Uri;
use GuzzleHttp\Psr7\UriResolver;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use SimpleXMLElement;
use Throwable;
use UnexpectedValueException;

/**
 * Fetches one feed and stores anything not seen before.
 *
 * RSS and Atom are both plain XML, so SimpleXML covers this without a feed
 * library. Existing items are never touched: url is the dedup key, and a
 * re-fetch must not resurface something already triaged.
 */
class FetchFeedSource
{
    private const int MAX_REDIRECTS = 3;

    private const int MAX_BYTES = 5 * 1024 * 1024;

    public function __construct(private ResolvePublicAddress $resolve) {}

    /**
     * @return int the number of items stored for the first time
     */
    public function __invoke(FeedSource $source): int
    {
        try {
            $stored = $this->store($source, $this->parse($this->download($source->url)));

            $source->forceFill(['last_fetched_at' => now(), 'last_error' => null])->save();

            return $stored;
        } catch (Throwable $exception) {
            $source->forceFill([
                'last_fetched_at' => now(),
                // Only a fixed sentence is kept: the raw message can quote
                // whatever the remote server answered, and it is shown in the UI.
                'last_error' => $this->describe($exception),
            ])->save();

            return 0;
        }
    }

    /**
     * Redirects are followed by hand so every hop goes through the same public
     * address check as the first URL.
     */
    private function download(string $url): string
    {
        for ($hop = 0; $hop <= self::MAX_REDIRECTS; $hop++) {
            $target = ($this->resolve)($url)
                ?? throw new UnexpectedValueException(__('The feed address is not a public web address.'));

            $response = Http::timeout(15)
                ->withUserAgent('ClearSight feed reader')
                ->withoutRedirecting()
                ->withOptions([
                    // Connect to the address that was checked, not a fresh lookup.
                    'curl' => [CURLOPT_RESOLVE => ["{$target['host']}:{$target['port']}:{$target['ip']}"]],
                    // Throwing here aborts the transfer mid-download.
                    'progress' => function (int $expected, int $downloaded): void {
                        if ($downloaded > self::MAX_BYTES) {
                            throw new UnexpectedValueException(__('The feed is larger than 5 MB.'));
                        }
                    },
                ])
                ->get($url);

            if (! $response->redirect()) {
                return $response->throw()->body();
            }

            $url = (string) UriResolver::resolve(new Uri($url), new Uri($response->header('Location')));
        }

        throw new UnexpectedValueException(__('The feed redirected too many times.'));
    }

    private function describe(Throwable $exception): string
    {
        // An abort from the progress callback arrives wrapped by the client.
        for ($cause = $exception; $cause !== null; $cause = $cause->getPrevious()) {
            if ($cause instanceof UnexpectedValueException) {
                return $cause->getMessage();
            }
        }

        return match (true) {
            $exception instanceof RequestException => __('The feed answered HTTP :status.', [
                'status' => $exception->response->status(),
            ]),
            $exception instanceof ConnectionException => __('Could not reach the feed.'),
            default => tap(__('The feed could not be read.'), fn () => report($exception)),
        };
    }

    /**
     * @param  list<array{title: string, url: string, summary: string|null, published_at: string|null}>  $entries
     */
    private function store(FeedSource $source, array $entries): int
    {
        $seen = RadarItem::query()
            ->whereIn('url', array_column($entries, 'url'))
            ->pluck('url')
            ->all();

        $stored = 0;

        foreach ($entries as $entry) {
            if (in_array($entry['url'], $seen, true)) {
                continue;
            }

            $source->radarItems()->create($entry);
            $seen[] = $entry['url'];
            $stored++;
        }

        return $stored;
    }

    /**
     * @return list<array{title: string, url: string, summary: string|null, published_at: string|null}>
     */
    public function parse(string $body): array
    {
        $previous = libxml_use_internal_errors(true);

        try {
            $xml = new SimpleXMLElement($body);
        } catch (Exception) {
            throw new UnexpectedValueException(__('The feed is not valid RSS or Atom.'));
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previous);
        }

        $entries = [];

        foreach ($xml->xpath('//item') ?: [] as $item) {
            $entries[] = [
                'title' => $this->text((string) $item->title, 250) ?? '',
                'url' => trim((string) $item->link),
                'summary' => $this->text(
                    (string) ($item->children('content', true)->encoded ?? '')
                        ?: (string) $item->description,
                ),
                'published_at' => $this->date((string) $item->pubDate),
            ];
        }

        foreach ($xml->xpath('//*[local-name()="entry"]') ?: [] as $entry) {
            $entries[] = [
                'title' => $this->text((string) $entry->title, 250) ?? '',
                'url' => $this->atomLink($entry),
                'summary' => $this->text(
                    (string) ($entry->summary ?? '') ?: (string) ($entry->content ?? ''),
                ),
                'published_at' => $this->date(
                    (string) ($entry->published ?? '') ?: (string) ($entry->updated ?? ''),
                ),
            ];
        }

        return array_values(array_filter(
            $entries,
            // Only web links: a feed is free to put javascript: or file: in a
            // link, and these URLs are rendered as hrefs and copied into work.
            fn (array $entry): bool => $entry['title'] !== ''
                && preg_match('#^https?://#i', $entry['url']) === 1,
        ));
    }

    /**
     * Atom puts the item URL on a link element's href, preferring rel="alternate".
     */
    private function atomLink(SimpleXMLElement $entry): string
    {
        $fallback = '';

        foreach ($entry->link as $link) {
            $href = trim((string) $link['href']);

            if ($href === '') {
                continue;
            }

            if ((string) $link['rel'] === 'alternate' || (string) $link['rel'] === '') {
                return $href;
            }

            $fallback = $fallback ?: $href;
        }

        return $fallback;
    }

    /**
     * Feed text is written by whoever runs the feed, so it is reduced to plain
     * text here rather than stored as the markup that arrived. Nothing
     * downstream renders it as HTML, and this keeps it that way even if
     * something later does.
     */
    private function text(string $value, int $limit = 1000): ?string
    {
        $plain = strip_tags(html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
        $plain = trim((string) preg_replace('/\s+/u', ' ', $plain));

        return $plain === '' ? null : Str::limit($plain, $limit);
    }

    private function date(string $value): ?string
    {
        $value = trim($value);

        if ($value === '') {
            return null;
        }

        $timestamp = strtotime($value);

        return $timestamp === false ? null : date('Y-m-d H:i:s', $timestamp);
    }
}
