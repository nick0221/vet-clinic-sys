<?php

namespace Database\Factories;

use App\Models\MedicalRecord;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MedicalRecord>
 */
class MedicalRecordFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'pet_id' => Pet::factory(),
            'veterinarian_id' => User::factory(),
            'appointment_id' => null,
            'visit_date' => fake()->date(),
            'subjective' => fake()->optional()->sentence(),
            'objective' => fake()->optional()->sentence(),
            'assessment' => fake()->optional()->sentence(),
            'plan' => fake()->optional()->sentence(),
            'notes' => fake()->optional()->sentence(),
            'temperature' => fake()->optional()->randomFloat(1, 36, 42),
            'heart_rate' => fake()->optional()->numberBetween(60, 220),
            'respiratory_rate' => fake()->optional()->numberBetween(10, 60),
            'weight' => fake()->optional()->randomFloat(1, 1, 80),
        ];
    }
}
