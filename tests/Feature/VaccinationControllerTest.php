<?php

use App\Models\Client;
use App\Models\Pet;
use App\Models\User;
use App\Models\Vaccination;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->user->assignRole('Admin');
    $this->actingAs($this->user);
});

test('index returns paginated vaccinations', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);
    Vaccination::factory()->count(3)->create([
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
    ]);

    $this->get(route('vaccinations.index'))->assertSuccessful();
});

test('store creates vaccination', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);

    $response = $this->post(route('vaccinations.store'), [
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
        'vaccine_name' => 'Rabies Vaccine',
        'date_administered' => today(),
        'next_due_date' => today()->addYear(),
    ]);

    $response->assertRedirect(route('vaccinations.index'));
    $this->assertDatabaseHas('vaccinations', ['vaccine_name' => 'Rabies Vaccine']);
});

test('guest cannot access vaccinations', function () {
    auth()->logout();
    $this->get(route('vaccinations.index'))->assertRedirect(route('login'));
});
