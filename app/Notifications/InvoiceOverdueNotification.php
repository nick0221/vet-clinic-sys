<?php

namespace App\Notifications;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvoiceOverdueNotification extends Notification
{
    use Queueable;

    public function __construct(public Invoice $invoice) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Invoice Overdue')
            ->line("Invoice {$this->invoice->invoice_number} is overdue.")
            ->line("Total: \${$this->invoice->total}")
            ->line("Due date: {$this->invoice->due_date}")
            ->action('View Invoice', route('invoices.show', $this->invoice));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'invoice_overdue',
            'invoice_id' => $this->invoice->id,
            'invoice_number' => $this->invoice->invoice_number,
            'total' => $this->invoice->total,
            'due_date' => $this->invoice->due_date?->toDateString(),
            'message' => "Invoice {$this->invoice->invoice_number} is overdue (\${$this->invoice->total})",
        ];
    }
}
