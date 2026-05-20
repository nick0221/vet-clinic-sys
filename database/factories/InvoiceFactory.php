<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 10, 1000);
        $tax = fake()->randomFloat(2, 1, 100);

        return [
            'client_id' => Client::factory(),
            'pet_id' => Pet::factory(),
            'veterinarian_id' => User::factory(),
            'invoice_number' => 'INV-'.fake()->unique()->bothify('#######'),
            'subtotal' => $subtotal,
            'tax' => $tax,
            'total' => $subtotal + $tax,
            'status' => fake()->randomElement(['draft', 'pending', 'paid']),
            'due_date' => fake()->optional()->dateTimeBetween('now', '+2 months'),
        ];
    }
}
