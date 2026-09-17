<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('clearsight:fetch-feeds')->hourly()->withoutOverlapping();

// Only RadarItem is prunable today: old discarded feed items with no links.
Schedule::command('model:prune')->daily()->withoutOverlapping();
