<?php

namespace Database\Factories;

use App\Models\LabRequest;
use App\Models\LabTest;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LabRequest>
 */
class LabRequestFactory extends Factory
{
    public function definition(): array
    {
        return [
            'pet_id' => Pet::factory(),
            'veterinarian_id' => User::factory(),
            'lab_test_id' => LabTest::factory(),
            'request_date' => fake()->date(),
            'status' => fake()->randomElement(['pending', 'collected', 'processing', 'completed']),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
