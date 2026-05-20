<?php

namespace App\Console\Commands;

use App\Models\Vaccination;
use App\Notifications\VaccinationDueNotification;
use Illuminate\Console\Command;

class CheckDueVaccinations extends Command
{
    protected $signature = 'vaccinations:check-due';

    protected $description = 'Check for vaccinations due within the next 7 days and send reminders';

    public function handle(): void
    {
        $dueVaccinations = Vaccination::with(['pet', 'veterinarian'])
            ->whereNotNull('next_due_date')
            ->whereBetween('next_due_date', [now(), now()->addDays(7)])
            ->get();

        if ($dueVaccinations->isEmpty()) {
            $this->info('No vaccinations due in the next 7 days.');

            return;
        }

        foreach ($dueVaccinations as $vaccination) {
            if ($vaccination->veterinarian) {
                $vaccination->veterinarian->notify(new VaccinationDueNotification($vaccination));
            }

            $this->info("Notification sent for vaccination #{$vaccination->id} ({$vaccination->vaccine_name})");
        }

        $this->info("Sent {$dueVaccinations->count()} vaccination due reminders.");
    }
}
