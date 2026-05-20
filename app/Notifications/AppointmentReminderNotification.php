<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentReminderNotification extends Notification
{
    use Queueable;

    public function __construct(public Appointment $appointment) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Appointment Reminder')
            ->line("Your appointment for {$this->appointment->pet?->name} is coming up.")
            ->line("Date: {$this->appointment->date_time}")
            ->line("Type: {$this->appointment->type}")
            ->action('View Appointment', route('appointments.show', $this->appointment));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'appointment_reminder',
            'appointment_id' => $this->appointment->id,
            'pet_name' => $this->appointment->pet?->name,
            'date_time' => $this->appointment->date_time->toDateTimeString(),
            'message' => "Appointment reminder: {$this->appointment->pet?->name} on {$this->appointment->date_time->format('M j, Y g:i A')}",
        ];
    }
}
