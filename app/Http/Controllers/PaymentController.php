<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Models\Payment;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function show(Payment $payment)
    {
        $this->authorize('payments.view');

        $payment->load('invoice');

        return Inertia::render('payments/show', [
            'payment' => $payment,
        ]);
    }

    public function store(StorePaymentRequest $request)
    {
        $this->authorize('payments.create');

        Payment::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Payment recorded successfully.']);

        return redirect()->back();
    }

    public function destroy(Payment $payment)
    {
        $this->authorize('payments.delete');

        $payment->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Payment deleted successfully.']);

        return redirect()->back();
    }
}
