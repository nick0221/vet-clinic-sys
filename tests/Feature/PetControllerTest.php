<?php

use App\Models\Client;
use App\Models\Pet;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->user->assignRole('Admin');
    $this->actingAs($this->user);
});

test('index returns paginated pets', function () {
    Client::factory()->create();
    Pet::factory()->count(3)->create();

    $response = $this->get(route('pets.index'));

    $response->assertSuccessful();
});

test('store creates a new pet', function () {
    $client = Client::factory()->create();
    $data = Pet::factory()->make(['client_id' => $client->id])->toArray();

    $response = $this->post(route('pets.store'), $data);

    $response->assertRedirect(route('pets.index'));
    $this->assertDatabaseHas('pets', ['name' => $data['name']]);
});

test('store requires name and species', function () {
    $response = $this->post(route('pets.store'), []);

    $response->assertSessionHasErrors(['name', 'species', 'client_id']);
});

test('show returns pet detail', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);

    $response = $this->get(route('pets.show', $pet));

    $response->assertSuccessful();
});

test('update modifies a pet', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);

    $response = $this->put(route('pets.update', $pet), [
        'client_id' => $client->id,
        'name' => 'Updated Pet Name',
        'species' => 'cat',
    ]);

    $response->assertRedirect(route('pets.index'));
    $this->assertDatabaseHas('pets', ['name' => 'Updated Pet Name']);
});

test('destroy deletes a pet', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);

    $response = $this->delete(route('pets.destroy', $pet));

    $response->assertRedirect(route('pets.index'));
    $this->assertSoftDeleted($pet);
});

test('guest cannot access pets', function () {
    auth()->logout();

    $this->get(route('pets.index'))->assertRedirect(route('login'));
});
