<?php

use App\Models\Client;
use App\Models\MedicalRecord;
use App\Models\Pet;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->user->assignRole('Admin');
    $this->actingAs($this->user);
});

test('index returns paginated medical records', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);
    MedicalRecord::factory()->count(3)->create([
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
    ]);

    $this->get(route('medical-records.index'))->assertSuccessful();
});

test('store creates medical record', function () {
    $client = Client::factory()->create();
    $pet = Pet::factory()->create(['client_id' => $client->id]);

    $response = $this->post(route('medical-records.store'), [
        'pet_id' => $pet->id,
        'veterinarian_id' => $this->user->id,
        'visit_date' => today(),
        'subjective' => 'Coughing for 3 days',
        'objective' => 'Temperature 38.5',
        'assessment' => 'Upper respiratory infection',
        'plan' => 'Antibiotics for 7 days',
    ]);

    $response->assertRedirect(route('medical-records.index'));
    $this->assertDatabaseHas('medical_records', ['assessment' => 'Upper respiratory infection']);
});

test('guest cannot access medical records', function () {
    auth()->logout();
    $this->get(route('medical-records.index'))->assertRedirect(route('login'));
});
