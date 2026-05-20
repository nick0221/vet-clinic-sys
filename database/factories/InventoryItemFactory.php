<?php

namespace Database\Factories;

use App\Models\InventoryItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryItem>
 */
class InventoryItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->word(),
            'sku' => fake()->unique()->bothify('SKU-####-??'),
            'category' => fake()->randomElement(['medication', 'supplies', 'equipment', 'food', 'accessories']),
            'description' => fake()->optional()->sentence(),
            'quantity_on_hand' => fake()->numberBetween(0, 500),
            'reorder_level' => fake()->numberBetween(5, 50),
            'unit_price' => fake()->randomFloat(2, 1, 500),
            'selling_price' => fake()->randomFloat(2, 1, 800),
            'supplier' => fake()->optional()->company(),
            'expiry_date' => fake()->optional()->dateTimeBetween('now', '+2 years'),
            'is_active' => true,
        ];
    }
}
