<?php

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->user->assignRole('Admin');
    $this->actingAs($this->user);
});

test('store creates a payment', function () {
    $invoice = Invoice::factory()->create();

    $response = $this->post(route('payments.store'), [
        'invoice_id' => $invoice->id,
        'amount' => 150.00,
        'payment_method' => 'card',
        'payment_date' => today(),
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('payments', ['amount' => 150.00]);
});

test('show returns payment detail', function () {
    $invoice = Invoice::factory()->create();
    $payment = Payment::factory()->create(['invoice_id' => $invoice->id]);

    $this->get(route('payments.show', $payment))->assertSuccessful();
});

test('destroy soft-deletes a payment', function () {
    $invoice = Invoice::factory()->create();
    $payment = Payment::factory()->create(['invoice_id' => $invoice->id]);

    $response = $this->delete(route('payments.destroy', $payment));

    $response->assertRedirect();
    $this->assertSoftDeleted($payment);
});

test('guest cannot access payments', function () {
    auth()->logout();

    $this->get(route('payments.index'))->assertRedirect(route('login'));
});
