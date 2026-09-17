<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Morph alias => table, as the rows were written.
     *
     * @var array<string, string>
     */
    private const TABLES = [
        'decision_record' => 'decision_records',
        'vetting_item' => 'vetting_items',
        'prototype' => 'prototypes',
        'security_note' => 'security_notes',
        'radar_item' => 'radar_items',
        'project' => 'projects',
    ];

    /**
     * Records deleted before links and technology entries were cleaned up with
     * them left those rows behind. They inflate the practice metrics and the
     * technology counts, and point at pages that no longer exist.
     */
    public function up(): void
    {
        foreach (self::TABLES as $alias => $table) {
            foreach (['source', 'target'] as $end) {
                DB::table('item_links')
                    ->where("{$end}_type", $alias)
                    ->whereNotExists(fn ($query) => $query->from($table)->whereColumn("{$table}.id", "item_links.{$end}_id"))
                    ->delete();
            }

            DB::table('technology_usages')
                ->where('usable_type', $alias)
                ->whereNotExists(fn ($query) => $query->from($table)->whereColumn("{$table}.id", 'technology_usages.usable_id'))
                ->delete();
        }
    }

    /**
     * Reverse the migrations.
     *
     * The rows pointed at nothing, so there is nothing to put back.
     */
    public function down(): void {}
};
