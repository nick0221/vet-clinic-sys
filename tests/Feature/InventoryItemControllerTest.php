<?php

use App\Models\InventoryItem;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->user->assignRole('Admin');
    $this->actingAs($this->user);
});

test('index returns paginated inventory items', function () {
    InventoryItem::factory()->count(3)->create();

    $this->get(route('inventory.index'))->assertSuccessful();
});

test('store creates an inventory item', function () {
    $response = $this->post(route('inventory.store'), [
        'name' => 'Amoxicillin',
        'sku' => 'SKU-0001',
        'category' => 'medication',
        'quantity_on_hand' => 100,
        'reorder_level' => 10,
        'unit_price' => 5.00,
        'selling_price' => 15.00,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('inventory_items', ['sku' => 'SKU-0001']);
});

test('show returns inventory item detail', function () {
    $item = InventoryItem::factory()->create();

    $this->get(route('inventory.show', $item))->assertSuccessful();
});

test('update modifies an inventory item', function () {
    $item = InventoryItem::factory()->create();

    $response = $this->put(route('inventory.update', $item), [
        'name' => 'Updated Item',
        'sku' => 'SKU-UPDATED',
        'category' => 'supplies',
        'quantity_on_hand' => 50,
        'reorder_level' => 5,
        'unit_price' => 10.00,
        'selling_price' => 25.00,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('inventory_items', ['sku' => 'SKU-UPDATED']);
});

test('destroy soft-deletes an inventory item', function () {
    $item = InventoryItem::factory()->create();

    $response = $this->delete(route('inventory.destroy', $item));

    $response->assertRedirect();
    $this->assertSoftDeleted($item);
});

test('guest cannot access inventory', function () {
    auth()->logout();

    $this->get(route('inventory.index'))->assertRedirect(route('login'));
});
