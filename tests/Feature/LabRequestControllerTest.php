<?php

use App\Models\Client;
use App\Models\LabRequest;
use App\Models\LabTest;
use App\Models\Pet;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->user->assignRole('Admin');
    $this->actingAs($this->user);
});

test('index returns paginated lab requests', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);
    $labTest = LabTest::factory()->create();
    LabRequest::factory()->count(3)->create([
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
        'lab_test_id' => $labTest->id,
    ]);

    $this->get(route('lab-requests.index'))->assertSuccessful();
});

test('store creates a lab request', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);
    $labTest = LabTest::factory()->create();

    $response = $this->post(route('lab-requests.store'), [
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
        'lab_test_id' => $labTest->id,
        'request_date' => today(),
        'status' => 'pending',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('lab_requests', ['pet_id' => $pet->id]);
});

test('show returns lab request detail', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);
    $labTest = LabTest::factory()->create();
    $labRequest = LabRequest::factory()->create([
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
        'lab_test_id' => $labTest->id,
    ]);

    $this->get(route('lab-requests.show', $labRequest))->assertSuccessful();
});

test('update modifies a lab request', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);
    $labTest = LabTest::factory()->create();
    $labRequest = LabRequest::factory()->create([
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
        'lab_test_id' => $labTest->id,
    ]);

    $response = $this->put(route('lab-requests.update', $labRequest), [
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
        'lab_test_id' => $labTest->id,
        'request_date' => today(),
        'status' => 'completed',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('lab_requests', ['status' => 'completed']);
});

test('destroy soft-deletes a lab request', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);
    $labTest = LabTest::factory()->create();
    $labRequest = LabRequest::factory()->create([
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
        'lab_test_id' => $labTest->id,
    ]);

    $response = $this->delete(route('lab-requests.destroy', $labRequest));

    $response->assertRedirect();
    $this->assertSoftDeleted($labRequest);
});

test('guest cannot access lab requests', function () {
    auth()->logout();

    $this->get(route('lab-requests.index'))->assertRedirect(route('login'));
});
