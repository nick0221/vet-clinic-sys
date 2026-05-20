<?php

use App\Models\Client;
use App\Models\Pet;
use App\Models\Prescription;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->user->assignRole('Admin');
    $this->actingAs($this->user);
});

test('index returns paginated prescriptions', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);
    Prescription::factory()->count(3)->create([
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
    ]);

    $this->get(route('prescriptions.index'))->assertSuccessful();
});

test('store creates prescription', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);

    $response = $this->post(route('prescriptions.store'), [
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
        'medication_name' => 'Amoxicillin',
        'dosage' => '250mg',
        'frequency' => 'twice daily',
        'duration' => '7 days',
        'quantity' => 14,
    ]);

    $response->assertRedirect(route('prescriptions.index'));
    $this->assertDatabaseHas('prescriptions', ['medication_name' => 'Amoxicillin']);
});

test('guest cannot access prescriptions', function () {
    auth()->logout();
    $this->get(route('prescriptions.index'))->assertRedirect(route('login'));
});
