<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('appointments:send-reminders')->dailyAt('08:00');
Schedule::command('vaccinations:check-due')->dailyAt('08:30');
Schedule::command('inventory:check-low-stock')->dailyAt('09:00');
Schedule::command('invoices:check-overdue')->dailyAt('09:30');
