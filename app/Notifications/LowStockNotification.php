<?php

namespace App\Notifications;

use App\Models\InventoryItem;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LowStockNotification extends Notification
{
    use Queueable;

    public function __construct(public InventoryItem $item) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Low Stock Alert')
            ->line("{$this->item->name} is running low on stock.")
            ->line("Current quantity: {$this->item->quantity_on_hand}")
            ->line("Reorder level: {$this->item->reorder_level}")
            ->action('View Item', route('inventory.show', $this->item));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'low_stock',
            'item_id' => $this->item->id,
            'item_name' => $this->item->name,
            'quantity_on_hand' => $this->item->quantity_on_hand,
            'reorder_level' => $this->item->reorder_level,
            'message' => "Low stock: {$this->item->name} ({$this->item->quantity_on_hand} remaining)",
        ];
    }
}
