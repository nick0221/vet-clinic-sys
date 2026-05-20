<?php

use App\Models\Client;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->user->assignRole('Admin');
    $this->actingAs($this->user);
});

test('index returns paginated clients', function () {
    Client::factory()->count(3)->create();

    $response = $this->get(route('clients.index'));

    $response->assertSuccessful();
});

test('store creates a new client', function () {
    $data = Client::factory()->make()->toArray();
    $data['email'] = fake()->email();
    $data['phone'] = fake()->phoneNumber();

    $response = $this->post(route('clients.store'), $data);

    $response->assertRedirect(route('clients.index'));
    $this->assertDatabaseHas('clients', ['name' => $data['name']]);
});

test('store requires name', function () {
    $response = $this->post(route('clients.store'), []);

    $response->assertSessionHasErrors('name');
});

test('show returns client detail', function () {
    $client = Client::factory()->create();

    $response = $this->get(route('clients.show', $client));

    $response->assertSuccessful();
});

test('update modifies a client', function () {
    $client = Client::factory()->create();

    $response = $this->put(route('clients.update', $client), [
        'name' => 'Updated Name',
        'email' => $client->email,
        'phone' => $client->phone,
    ]);

    $response->assertRedirect(route('clients.index'));
    $this->assertDatabaseHas('clients', ['name' => 'Updated Name']);
});

test('destroy deletes a client', function () {
    $client = Client::factory()->create();

    $response = $this->delete(route('clients.destroy', $client));

    $response->assertRedirect(route('clients.index'));
    $this->assertSoftDeleted($client);
});

test('guest cannot access clients', function () {
    auth()->logout();

    $this->get(route('clients.index'))->assertRedirect(route('login'));
});
