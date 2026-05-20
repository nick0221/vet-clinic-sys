<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('invoices.view-any');

        $query = Invoice::with(['client', 'pet', 'veterinarian', 'items']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $invoices = $query->latest()->paginate(10);

        return Inertia::render('invoices/index', [
            'invoices' => $invoices,
            'clients' => Client::select('id', 'name')->get(),
            'pets' => Pet::select('id', 'name')->get(),
            'veterinarians' => User::role('Veterinarian')->get(['id', 'name']),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(StoreInvoiceRequest $request): RedirectResponse
    {
        $this->authorize('invoices.create');

        $data = $request->validated();
        $items = $data['items'] ?? null;
        unset($data['items']);

        if ($items) {
            $subtotal = collect($items)->sum(fn ($item) => $item['quantity'] * $item['unit_price']);
            $taxAmount = $subtotal * (($data['tax'] ?? 0) / 100);
            $data['subtotal'] = $subtotal;
            $data['tax'] = $taxAmount;
            $data['total'] = $subtotal + $taxAmount;
        }

        if (! isset($data['invoice_number'])) {
            $lastInvoice = Invoice::whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->orderBy('id', 'desc')
                ->first();

            $sequence = $lastInvoice ? ((int) substr($lastInvoice->invoice_number, -4)) + 1 : 1;
            $data['invoice_number'] = 'INV-'.now()->format('Ym').'-'.str_pad($sequence, 4, '0', STR_PAD_LEFT);
        }

        $invoice = Invoice::create($data);

        if ($items) {
            foreach ($items as $item) {
                $invoice->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'type' => $item['type'],
                    'total' => $item['quantity'] * $item['unit_price'],
                ]);
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Invoice created successfully.']);

        return to_route('invoices.index');
    }

    public function show(Invoice $invoice)
    {
        $this->authorize('invoices.view');

        $invoice->load(['client', 'pet', 'veterinarian', 'items', 'payments']);

        return Inertia::render('invoices/show', [
            'invoice' => $invoice,
        ]);
    }

    public function update(UpdateInvoiceRequest $request, Invoice $invoice)
    {
        $this->authorize('invoices.update');

        $data = $request->validated();
        $items = $data['items'] ?? null;
        unset($data['items']);

        if ($items) {
            $subtotal = collect($items)->sum(fn ($item) => $item['quantity'] * $item['unit_price']);
            $taxAmount = $subtotal * (($data['tax'] ?? 0) / 100);
            $data['subtotal'] = $subtotal;
            $data['tax'] = $taxAmount;
            $data['total'] = $subtotal + $taxAmount;

            $invoice->items()->delete();

            foreach ($items as $item) {
                $invoice->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'type' => $item['type'],
                    'total' => $item['quantity'] * $item['unit_price'],
                ]);
            }
        }

        $invoice->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Invoice updated successfully.']);

        return redirect()->back();
    }

    public function destroy(Invoice $invoice)
    {
        $this->authorize('invoices.delete');

        $invoice->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Invoice deleted successfully.']);

        return redirect()->back();
    }

    public function restore($id)
    {
        $this->authorize('invoices.restore');

        $invoice = Invoice::withTrashed()->findOrFail($id);
        $invoice->restore();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Invoice restored successfully.']);

        return redirect()->back();
    }
}
