<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() ? $request->user()->load('roles') : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'permissions' => $request->user() ? $request->user()->getAllPermissions()->pluck('name')->toArray() : [],
            'notifications' => $request->user() ? [
                'unreadCount' => $request->user()->unreadNotifications()->count(),
                'recent' => $request->user()->unreadNotifications()->latest()->take(5)->get()->toArray(),
            ] : ['unreadCount' => 0, 'recent' => []],
            'systemSettings' => Setting::allAsArray(),
        ];
    }
}
