<?php

use App\Models\Client;
use App\Models\Pet;
use App\Models\Surgery;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->user->assignRole('Admin');
    $this->actingAs($this->user);
});

test('index returns paginated surgeries', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);
    Surgery::factory()->count(3)->create([
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
    ]);

    $this->get(route('surgeries.index'))->assertSuccessful();
});

test('store creates a surgery', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);

    $response = $this->post(route('surgeries.store'), [
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
        'surgery_name' => 'Spay',
        'scheduled_date' => today()->addDays(7),
        'status' => 'scheduled',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('surgeries', ['surgery_name' => 'Spay']);
});

test('show returns surgery detail', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);
    $surgery = Surgery::factory()->create([
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
    ]);

    $this->get(route('surgeries.show', $surgery))->assertSuccessful();
});

test('update modifies a surgery', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);
    $surgery = Surgery::factory()->create([
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
    ]);

    $response = $this->put(route('surgeries.update', $surgery), [
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
        'surgery_name' => 'Neuter',
        'scheduled_date' => today()->addDays(14),
        'status' => 'scheduled',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('surgeries', ['surgery_name' => 'Neuter']);
});

test('destroy soft-deletes a surgery', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);
    $surgery = Surgery::factory()->create([
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
    ]);

    $response = $this->delete(route('surgeries.destroy', $surgery));

    $response->assertRedirect();
    $this->assertSoftDeleted($surgery);
});

test('guest cannot access surgeries', function () {
    auth()->logout();

    $this->get(route('surgeries.index'))->assertRedirect(route('login'));
});
