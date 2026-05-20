<?php

namespace Database\Factories;

use App\Models\Pet;
use App\Models\Surgery;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Surgery>
 */
class SurgeryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'pet_id' => Pet::factory(),
            'veterinarian_id' => User::factory(),
            'surgery_name' => fake()->randomElement(['Spay', 'Neuter', 'Mass Removal', 'Dental Cleaning', 'Orthopedic Repair']),
            'description' => fake()->optional()->sentence(),
            'scheduled_date' => fake()->dateTimeBetween('now', '+2 months'),
            'start_time' => fake()->optional()->time(),
            'end_time' => fake()->optional()->time(),
            'status' => fake()->randomElement(['scheduled', 'in_progress', 'completed', 'cancelled']),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
