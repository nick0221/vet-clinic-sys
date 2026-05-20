<?php

use App\Models\Client;
use App\Models\Invoice;
use App\Models\Pet;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->user->assignRole('Admin');
    $this->actingAs($this->user);
});

test('index returns paginated invoices', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);
    Invoice::factory()->count(3)->create([
        'client_id' => $client->id,
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
    ]);

    $this->get(route('invoices.index'))->assertSuccessful();
});

test('store creates an invoice', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);

    $response = $this->post(route('invoices.store'), [
        'client_id' => $client->id,
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
        'invoice_number' => 'INV-0000001',
        'subtotal' => 100.00,
        'tax' => 10.00,
        'total' => 110.00,
        'status' => 'pending',
        'due_date' => today()->addDays(30),
    ]);

    $response->assertRedirect(route('invoices.index'));
    $this->assertDatabaseHas('invoices', ['invoice_number' => 'INV-0000001']);
});

test('show returns invoice detail', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);
    $invoice = Invoice::factory()->create([
        'client_id' => $client->id,
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
    ]);

    $this->get(route('invoices.show', $invoice))->assertSuccessful();
});

test('update modifies an invoice', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);
    $invoice = Invoice::factory()->create([
        'client_id' => $client->id,
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
    ]);

    $response = $this->put(route('invoices.update', $invoice), [
        'client_id' => $client->id,
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
        'invoice_number' => 'INV-UPDATED',
        'subtotal' => 200.00,
        'tax' => 20.00,
        'total' => 220.00,
        'status' => 'paid',
        'due_date' => today()->addDays(30),
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('invoices', ['invoice_number' => 'INV-UPDATED']);
});

test('destroy soft-deletes an invoice', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);
    $invoice = Invoice::factory()->create([
        'client_id' => $client->id,
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
    ]);

    $response = $this->delete(route('invoices.destroy', $invoice));

    $response->assertRedirect();
    $this->assertSoftDeleted($invoice);
});

test('guest cannot access invoices', function () {
    auth()->logout();

    $this->get(route('invoices.index'))->assertRedirect(route('login'));
});
