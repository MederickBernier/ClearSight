<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Feed links routinely carry tracking query strings past 255 characters,
     * and one such item used to fail the insert and drop the rest of that feed
     * on every fetch. The unique index stays: url is still the dedup key.
     */
    public function up(): void
    {
        Schema::table('radar_items', function (Blueprint $table) {
            $table->text('url')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('radar_items', function (Blueprint $table) {
            $table->string('url')->change();
        });
    }
};
