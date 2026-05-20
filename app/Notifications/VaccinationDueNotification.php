<?php

namespace App\Notifications;

use App\Models\Vaccination;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VaccinationDueNotification extends Notification
{
    use Queueable;

    public function __construct(public Vaccination $vaccination) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Vaccination Due Reminder')
            ->line("The {$this->vaccination->vaccine_name} vaccination for {$this->vaccination->pet?->name} is due.")
            ->line("Due date: {$this->vaccination->next_due_date}")
            ->action('View Vaccination', route('vaccinations.show', $this->vaccination));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'vaccination_due',
            'vaccination_id' => $this->vaccination->id,
            'pet_name' => $this->vaccination->pet?->name,
            'vaccine_name' => $this->vaccination->vaccine_name,
            'next_due_date' => $this->vaccination->next_due_date?->toDateString(),
            'message' => "Vaccination due: {$this->vaccination->vaccine_name} for {$this->vaccination->pet?->name}",
        ];
    }
}
