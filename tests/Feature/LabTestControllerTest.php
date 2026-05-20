<?php

use App\Models\LabTest;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->user->assignRole('Admin');
    $this->actingAs($this->user);
});

test('index returns paginated lab tests', function () {
    LabTest::factory()->count(3)->create();

    $this->get(route('lab-tests.index'))->assertSuccessful();
});

test('store creates a lab test', function () {
    $response = $this->post(route('lab-tests.store'), [
        'name' => 'Complete Blood Count',
        'category' => 'blood',
        'price' => 75.00,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('lab_tests', ['name' => 'Complete Blood Count']);
});

test('show returns lab test detail', function () {
    $labTest = LabTest::factory()->create();

    $this->get(route('lab-tests.show', $labTest))->assertSuccessful();
});

test('update modifies a lab test', function () {
    $labTest = LabTest::factory()->create();

    $response = $this->put(route('lab-tests.update', $labTest), [
        'name' => 'Updated Lab Test',
        'category' => 'urine',
        'price' => 100.00,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('lab_tests', ['name' => 'Updated Lab Test']);
});

test('destroy soft-deletes a lab test', function () {
    $labTest = LabTest::factory()->create();

    $response = $this->delete(route('lab-tests.destroy', $labTest));

    $response->assertRedirect();
    $this->assertSoftDeleted($labTest);
});

test('guest cannot access lab tests', function () {
    auth()->logout();

    $this->get(route('lab-tests.index'))->assertRedirect(route('login'));
});
