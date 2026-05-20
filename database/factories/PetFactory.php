<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Pet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pet>
 */
class PetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'client_id' => Client::factory(),
            'name' => fake()->firstName(),
            'species' => fake()->randomElement(['dog', 'cat', 'bird', 'rabbit', 'reptile']),
            'breed' => fake()->optional()->word(),
            'sex' => fake()->randomElement(['male', 'female']),
            'date_of_birth' => fake()->optional()->date(),
            'weight' => fake()->optional()->randomFloat(2, 0.5, 100),
            'color' => fake()->optional()->safeColorName(),
            'microchip_id' => fake()->unique()->regexify('[A-Z]{3}[0-9]{4}[A-Z]{4}'),
            'photo' => null,
            'notes' => fake()->optional()->sentence(),
            'is_active' => true,
        ];
    }
}
