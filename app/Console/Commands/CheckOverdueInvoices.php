<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use App\Models\User;
use App\Notifications\InvoiceOverdueNotification;
use Illuminate\Console\Command;

class CheckOverdueInvoices extends Command
{
    protected $signature = 'invoices:check-overdue';

    protected $description = 'Check for overdue invoices and send alerts';

    public function handle(): void
    {
        $overdueInvoices = Invoice::with(['client'])
            ->whereNotIn('status', ['paid', 'cancelled'])
            ->whereNotNull('due_date')
            ->where('due_date', '<', now())
            ->get();

        if ($overdueInvoices->isEmpty()) {
            $this->info('No overdue invoices found.');

            return;
        }

        $admins = User::role('Admin')->get();

        foreach ($overdueInvoices as $invoice) {
            foreach ($admins as $admin) {
                $admin->notify(new InvoiceOverdueNotification($invoice));
            }

            $this->info("Overdue alert for invoice {$invoice->invoice_number}");
        }

        $this->info("Sent alerts for {$overdueInvoices->count()} overdue invoices.");
    }
}
