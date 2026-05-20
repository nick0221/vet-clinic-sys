<?php

namespace App\Console\Commands;

use App\Models\InventoryItem;
use App\Models\User;
use App\Notifications\LowStockNotification;
use Illuminate\Console\Command;

class CheckLowStock extends Command
{
    protected $signature = 'inventory:check-low-stock';

    protected $description = 'Check inventory for items below reorder level and send alerts';

    public function handle(): void
    {
        $lowStockItems = InventoryItem::whereColumn('quantity_on_hand', '<=', 'reorder_level')->get();

        if ($lowStockItems->isEmpty()) {
            $this->info('All inventory items are above reorder levels.');

            return;
        }

        $admins = User::role('Admin')->get();

        foreach ($lowStockItems as $item) {
            foreach ($admins as $admin) {
                $admin->notify(new LowStockNotification($item));
            }

            $this->info("Low stock alert for {$item->name} ({$item->quantity_on_hand} remaining)");
        }

        $this->info("Sent alerts for {$lowStockItems->count()} low stock items.");
    }
}
