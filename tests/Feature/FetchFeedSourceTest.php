<?php

use App\Actions\FetchFeedSource;
use App\Actions\ResolvePublicAddress;
use App\Enums\TriageStatus;
use App\Models\FeedSource;
use App\Models\RadarItem;
use Illuminate\Support\Facades\Http;

function rssFeed(): string
{
    return <<<'XML'
<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Example blog</title>
    <item>
      <title>Postgres 18 is out</title>
      <link>https://example.test/postgres-18</link>
      <description>&lt;p&gt;The &lt;b&gt;release&lt;/b&gt; lands today.&lt;/p&gt;</description>
      <pubDate>Mon, 01 Jun 2026 09:00:00 +0000</pubDate>
    </item>
    <item>
      <title>Queues without tears</title>
      <link>https://example.test/queues</link>
      <pubDate>Tue, 02 Jun 2026 09:00:00 +0000</pubDate>
    </item>
  </channel>
</rss>
XML;
}

function atomFeed(): string
{
    return <<<'XML'
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Example journal</title>
  <entry>
    <title>On watchtowers</title>
    <summary>A short note on lookouts.</summary>
    <link rel="alternate" href="https://example.test/watchtowers"/>
    <published>2026-06-03T09:00:00Z</published>
  </entry>
</feed>
XML;
}

test('it stores items from an rss feed', function () {
    Http::fake(['*' => Http::response(rssFeed())]);

    $source = FeedSource::factory()->create();

    expect(app(FetchFeedSource::class)($source))->toBe(2);

    $item = RadarItem::where('url', 'https://example.test/postgres-18')->sole();

    expect($item->title)->toBe('Postgres 18 is out')
        ->and($item->feed_source_id)->toBe($source->id)
        ->and($item->triage_status)->toBe(TriageStatus::Pending)
        ->and($item->published_at->toDateString())->toBe('2026-06-01')
        ->and($item->summary)->toBe('The release lands today.')
        ->and($item->fetched_at)->not->toBeNull()
        ->and($source->refresh()->last_fetched_at)->not->toBeNull();
});

test('it stores items from an atom feed', function () {
    Http::fake(['*' => Http::response(atomFeed())]);

    $source = FeedSource::factory()->create();

    expect(app(FetchFeedSource::class)($source))->toBe(1);

    expect(RadarItem::sole()->url)->toBe('https://example.test/watchtowers')
        ->and(RadarItem::sole()->summary)->toBe('A short note on lookouts.');
});

test('a re-fetch does not resurface an item that was already triaged', function () {
    Http::fake(['*' => Http::response(rssFeed())]);

    $source = FeedSource::factory()->create();
    $fetch = app(FetchFeedSource::class);

    $fetch($source);

    RadarItem::where('url', 'https://example.test/queues')
        ->sole()
        ->update(['triage_status' => TriageStatus::Discarded]);

    expect($fetch($source))->toBe(0)
        ->and(RadarItem::count())->toBe(2)
        ->and(RadarItem::where('url', 'https://example.test/queues')->sole()->triage_status)
        ->toBe(TriageStatus::Discarded);
});

test('it records a failed fetch on the source instead of throwing', function () {
    Http::fake(['*' => Http::response('nope', 500)]);

    $source = FeedSource::factory()->create();

    expect(app(FetchFeedSource::class)($source))->toBe(0)
        ->and($source->refresh()->last_error)->not->toBeNull()
        ->and($source->last_fetched_at)->not->toBeNull()
        ->and(RadarItem::count())->toBe(0);
});

test('it survives a feed that is not valid xml', function () {
    Http::fake(['*' => Http::response('<rss><channel><item>')]);

    $source = FeedSource::factory()->create();

    expect(app(FetchFeedSource::class)($source))->toBe(0)
        ->and($source->refresh()->last_error)->not->toBeNull();
});

test('it skips entries with no title or link', function () {
    Http::fake(['*' => Http::response(<<<'XML'
<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item><title>Keeps this</title><link>https://example.test/keep</link></item>
  <item><title>No link</title></item>
  <item><link>https://example.test/no-title</link></item>
</channel></rss>
XML)]);

    expect(app(FetchFeedSource::class)(FeedSource::factory()->create()))->toBe(1);
});

test('the command fetches only active sources', function () {
    Http::fake(['*' => Http::response(rssFeed())]);

    FeedSource::factory()->create();
    FeedSource::factory()->inactive()->create();

    $this->artisan('clearsight:fetch-feeds')->assertSuccessful();

    expect(RadarItem::count())->toBe(2);
});

test('it stores feed text as plain text, never as the markup that arrived', function () {
    Http::fake(['*' => Http::response(<<<'XML'
<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item>
    <title>Tidy &amp;amp; short</title>
    <link>https://example.test/xss</link>
    <description>&lt;script&gt;alert('x')&lt;/script&gt;Real   summary
    text</description>
  </item>
</channel></rss>
XML)]);

    app(FetchFeedSource::class)(FeedSource::factory()->create());

    $item = RadarItem::sole();

    expect($item->summary)->toBe("alert('x')Real summary text")
        ->and($item->summary)->not->toContain('<script>')
        ->and($item->title)->toBe('Tidy & short');
});

test('it stores no summary when the feed gives none', function () {
    Http::fake(['*' => Http::response(<<<'XML'
<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item><title>Bare</title><link>https://example.test/bare</link></item>
</channel></rss>
XML)]);

    app(FetchFeedSource::class)(FeedSource::factory()->create());

    expect(RadarItem::sole()->summary)->toBeNull();
});

test('the seed command adds the starter feeds once', function () {
    $this->artisan('clearsight:seed-feeds')->assertSuccessful();

    $first = FeedSource::count();

    expect($first)->toBeGreaterThan(0);

    $this->artisan('clearsight:seed-feeds')->assertSuccessful();

    expect(FeedSource::count())->toBe($first)
        ->and(FeedSource::pluck('url')->unique())->toHaveCount($first);
});

test('the seed command leaves a source you already changed alone', function () {
    $this->artisan('clearsight:seed-feeds');

    $source = FeedSource::query()->firstOrFail();
    $source->update(['name' => 'Renamed', 'is_active' => false]);

    $this->artisan('clearsight:seed-feeds');

    expect($source->refresh()->name)->toBe('Renamed')
        ->and($source->is_active)->toBeFalse();
});

test('it refuses to fetch a feed on an internal address', function (string $url) {
    Http::fake();

    $source = FeedSource::factory()->create(['url' => $url]);

    expect(app(FetchFeedSource::class)($source))->toBe(0)
        ->and($source->refresh()->last_error)->toBe('The feed address is not a public web address.');

    Http::assertNothingSent();
})->with([
    'loopback' => 'http://127.0.0.1/feed.xml',
    'cloud metadata' => 'http://169.254.169.254/latest/meta-data',
    'private network' => 'http://10.0.0.5/feed.xml',
    'carrier-grade nat' => 'http://100.64.0.1/feed.xml',
    'ipv6 loopback' => 'http://[::1]/feed.xml',
]);

test('it refuses a hostname that resolves to an internal address', function () {
    app()->instance(ResolvePublicAddress::class, new class extends ResolvePublicAddress
    {
        protected function lookup(string $host): array
        {
            return ['192.168.1.10'];
        }
    });
    Http::fake();

    $source = FeedSource::factory()->create(['url' => 'https://intranet.example.test/feed.xml']);

    app(FetchFeedSource::class)($source);

    expect($source->refresh()->last_error)->toBe('The feed address is not a public web address.');
    Http::assertNothingSent();
});

test('it checks every redirect hop, not only the first url', function () {
    Http::fake([
        'example.test/*' => Http::response('', 302, ['Location' => 'http://127.0.0.1/admin']),
    ]);

    $source = FeedSource::factory()->create(['url' => 'https://example.test/feed.xml']);

    expect(app(FetchFeedSource::class)($source))->toBe(0)
        ->and($source->refresh()->last_error)->toBe('The feed address is not a public web address.');

    Http::assertSentCount(1);
});

test('it follows a redirect to another public address', function () {
    Http::fake([
        'old.test/*' => Http::response('', 301, ['Location' => 'https://new.test/feed.xml']),
        'new.test/*' => Http::response(rssFeed()),
    ]);

    $source = FeedSource::factory()->create(['url' => 'https://old.test/feed.xml']);

    expect(app(FetchFeedSource::class)($source))->toBe(2)
        ->and($source->refresh()->last_error)->toBeNull();
});

test('a failed fetch keeps a fixed message rather than what the server answered', function () {
    Http::fake(['*' => Http::response('<h1>Secret internal page</h1>', 500)]);

    $source = FeedSource::factory()->create();

    app(FetchFeedSource::class)($source);

    expect($source->refresh()->last_error)->toBe('The feed answered HTTP 500.');
});

test('it drops entries whose link is not a web address', function () {
    Http::fake(['*' => Http::response(<<<'XML'
<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item><title>Harmless</title><link>https://example.test/ok</link></item>
  <item><title>Script</title><link>javascript:alert(1)</link></item>
  <item><title>File</title><link>file:///etc/passwd</link></item>
</channel></rss>
XML)]);

    app(FetchFeedSource::class)(FeedSource::factory()->create());

    expect(RadarItem::pluck('url')->all())->toBe(['https://example.test/ok']);
});
