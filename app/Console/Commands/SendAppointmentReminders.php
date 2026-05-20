<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Notifications\AppointmentReminderNotification;
use Illuminate\Console\Command;

class SendAppointmentReminders extends Command
{
    protected $signature = 'appointments:send-reminders';

    protected $description = 'Send reminders for upcoming appointments within 24 hours';

    public function handle(): void
    {
        $upcoming = Appointment::with(['pet', 'client', 'veterinarian'])
            ->whereBetween('date_time', [now(), now()->addDay()])
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->get();

        if ($upcoming->isEmpty()) {
            $this->info('No upcoming appointments to remind about.');

            return;
        }

        foreach ($upcoming as $appointment) {
            if ($appointment->veterinarian) {
                $appointment->veterinarian->notify(new AppointmentReminderNotification($appointment));
            }

            $this->info("Reminder sent for appointment #{$appointment->id} ({$appointment->pet?->name})");
        }

        $this->info("Sent {$upcoming->count()} appointment reminders.");
    }
}
