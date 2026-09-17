<?php

namespace App\Http\Controllers;

use App\Http\Requests\Technologies\StoreTechnologyUsageRequest;
use App\Models\TechnologyUsage;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

/**
 * Recording that a particular record is built with a particular technology.
 */
class TechnologyUsageController extends Controller
{
    public function store(StoreTechnologyUsageRequest $request): RedirectResponse
    {
        TechnologyUsage::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Technology recorded.')]);

        return back();
    }

    public function update(StoreTechnologyUsageRequest $request, TechnologyUsage $technologyUsage): RedirectResponse
    {
        // Which technology and which record are what the entry is; moving it
        // is removing it and recording another.
        $technologyUsage->update($request->safe()->only(['version', 'role', 'notes']));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Entry updated.')]);

        return back();
    }

    public function destroy(TechnologyUsage $technologyUsage): RedirectResponse
    {
        $technologyUsage->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Entry removed.')]);

        return back();
    }
}
