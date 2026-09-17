<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * What is written about a technology, and why a record runs it, is the
     * team's own assessment rather than public catalogue data, so it joins the
     * rest of the work content encrypted at rest. Names, rings, statuses and
     * versions stay plain: they are filtered and grouped on.
     *
     * @var array<string, list<string>>
     */
    private const COLUMNS = [
        'technologies' => ['notes'],
        'technology_usages' => ['role', 'notes'],
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('technology_usages', function (Blueprint $table) {
            // Ciphertext outgrows a varchar(255).
            $table->text('role')->nullable()->change();
        });

        $this->transform(function (string $value): string {
            try {
                Crypt::decryptString($value);

                return $value;
            } catch (Throwable) {
                return Crypt::encryptString($value);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $this->transform(function (string $value): string {
            try {
                return Crypt::decryptString($value);
            } catch (Throwable) {
                return $value;
            }
        });
    }

    /**
     * @param  callable(string): string  $transform
     */
    private function transform(callable $transform): void
    {
        foreach (self::COLUMNS as $table => $columns) {
            DB::table($table)->orderBy('id')->chunkById(200, function ($rows) use ($table, $columns, $transform): void {
                foreach ($rows as $row) {
                    $changes = [];

                    foreach ($columns as $column) {
                        if ($row->{$column} !== null) {
                            $changes[$column] = $transform((string) $row->{$column});
                        }
                    }

                    if ($changes !== []) {
                        DB::table($table)->where('id', $row->id)->update($changes);
                    }
                }
            });
        }
    }
};
