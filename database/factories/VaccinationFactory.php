<?php

namespace Database\Factories;

use App\Models\Pet;
use App\Models\User;
use App\Models\Vaccination;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vaccination>
 */
class VaccinationFactory extends Factory
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
            'medical_record_id' => null,
            'vaccine_name' => fake()->randomElement(['Rabies', 'Distemper', 'Parvovirus', 'Bordetella', 'Leptospirosis', 'FVRCP']),
            'manufacturer' => fake()->optional()->company(),
            'batch_number' => fake()->optional()->bothify('BATCH-####'),
            'date_administered' => fake()->date(),
            'next_due_date' => fake()->boolean() ? fake()->dateTimeBetween('+1 month', '+1 year')->format('Y-m-d') : null,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
