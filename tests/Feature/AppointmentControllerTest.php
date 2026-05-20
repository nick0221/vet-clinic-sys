<?php

use App\Models\Appointment;
use App\Models\Client;
use App\Models\Pet;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->user->assignRole('Admin');
    $this->actingAs($this->user);
});

test('index returns paginated appointments', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);
    Appointment::factory()->count(3)->create([
        'pet_id' => $pet->id,
        'client_id' => $client->id,
        'veterinarian_id' => $this->user->id,
    ]);

    $this->get(route('appointments.index'))->assertSuccessful();
});

test('store creates appointment', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);

    $response = $this->post(route('appointments.store'), [
        'pet_id' => $pet->id,
        'client_id' => $client->id,
        'veterinarian_id' => $this->user->id,
        'date_time' => now()->addDay(),
        'status' => 'scheduled',
        'reason' => 'Annual checkup',
        'duration' => 30,
        'type' => 'checkup',
    ]);

    $response->assertRedirect(route('appointments.index'));
    $this->assertDatabaseHas('appointments', ['reason' => 'Annual checkup']);
});

test('show returns appointment detail', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);
    $appointment = Appointment::factory()->create([
        'pet_id' => $pet->id, 'client_id' => $client->id, 'veterinarian_id' => $this->user->id,
    ]);

    $this->get(route('appointments.show', $appointment))->assertSuccessful();
});

test('guest cannot access appointments', function () {
    auth()->logout();
    $this->get(route('appointments.index'))->assertRedirect(route('login'));
});
