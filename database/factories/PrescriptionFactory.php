<?php

namespace Database\Factories;

use App\Models\Pet;
use App\Models\Prescription;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Prescription>
 */
class PrescriptionFactory extends Factory
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
            'medication_name' => fake()->randomElement(['Amoxicillin', 'Metronidazole', 'Prednisone', 'Carprofen', 'Doxycycline', 'Gabapentin']),
            'dosage' => fake()->randomElement(['50mg', '100mg', '250mg', '500mg', '5mg', '10mg']),
            'frequency' => fake()->randomElement(['once daily', 'twice daily', 'three times daily', 'every 12 hours', 'as needed']),
            'route' => fake()->optional()->randomElement(['oral', 'topical', 'injectable', 'ocular']),
            'duration' => fake()->optional()->randomElement(['5 days', '7 days', '10 days', '14 days', '30 days']),
            'quantity' => fake()->optional()->numberBetween(5, 100),
            'refills' => fake()->optional()->numberBetween(0, 3),
            'notes' => fake()->optional()->sentence(),
            'start_date' => fake()->optional()->date(),
            'end_date' => null,
        ];
    }
}
