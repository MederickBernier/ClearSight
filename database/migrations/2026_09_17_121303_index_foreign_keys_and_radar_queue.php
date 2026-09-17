<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Postgres does not index a foreign key on its own, and these are filtered
     * on for every project page, counted on the dashboard and project list, and
     * walked on every cascading delete.
     *
     * @var array<string, list<string>>
     */
    private const FOREIGN_KEYS = [
        'decision_records' => ['project_id'],
        'vetting_items' => ['project_id'],
        'prototypes' => ['project_id'],
        'security_notes' => ['project_id'],
        'project_notes' => ['project_id'],
        'decision_options' => ['decision_record_id'],
        'decision_links' => ['target_id'],
        'radar_items' => ['feed_source_id'],
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach (self::FOREIGN_KEYS as $table => $columns) {
            Schema::table($table, function (Blueprint $blueprint) use ($columns) {
                foreach ($columns as $column) {
                    $blueprint->index($column);
                }
            });
        }

        // The radar queue: visible items, newest first, undated ones last. The
        // blueprint cannot say DESC NULLS LAST, and without it Postgres sorts
        // the whole growing table on every page.
        DB::statement('create index radar_items_queue_index on radar_items (is_hidden, published_at desc nulls last, id desc)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('drop index if exists radar_items_queue_index');

        foreach (self::FOREIGN_KEYS as $table => $columns) {
            Schema::table($table, function (Blueprint $blueprint) use ($columns) {
                foreach ($columns as $column) {
                    $blueprint->dropIndex([$column]);
                }
            });
        }
    }
};
