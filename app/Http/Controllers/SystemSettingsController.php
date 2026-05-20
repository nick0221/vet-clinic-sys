<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingsController extends Controller
{
    public function edit(Request $request): Response
    {
        $this->authorize('settings.view');

        return Inertia::render('settings/system', [
            'settings' => Setting::allAsArray(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $this->authorize('settings.update');

        $validated = $request->validate([
            'site_name' => 'required|string|max:255',
            'site_description' => 'nullable|string|max:500',
            'site_tagline' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'business_hours' => 'nullable|string|max:255',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, $value ?? '');
        }

        if ($request->hasFile('brand_logo')) {
            $path = $request->file('brand_logo')->store('settings', 'public');
            Setting::set('brand_logo', $path);
        }

        return back()->with('success', 'Settings updated successfully.');
    }
}
