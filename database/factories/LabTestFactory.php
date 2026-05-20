<?php

namespace Database\Factories;

use App\Models\LabTest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LabTest>
 */
class LabTestFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word().' Test',
            'description' => fake()->optional()->sentence(),
            'category' => fake()->randomElement(['blood', 'urine', 'imaging', 'microbiology', 'pathology']),
            'price' => fake()->randomFloat(2, 10, 500),
            'is_active' => true,
        ];
    }
}
