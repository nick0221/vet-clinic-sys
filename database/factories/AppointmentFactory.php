<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Appointment>
 */
class AppointmentFactory extends Factory
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
            'client_id' => Client::factory(),
            'veterinarian_id' => User::factory(),
            'date_time' => fake()->dateTimeBetween('-1 month', '+2 months'),
            'status' => fake()->randomElement(['scheduled', 'confirmed', 'completed', 'cancelled']),
            'reason' => fake()->sentence(),
            'notes' => fake()->optional()->sentence(),
            'duration' => fake()->randomElement([15, 30, 45, 60]),
            'type' => fake()->randomElement(['checkup', 'vaccination', 'follow_up', 'surgery', 'dental']),
        ];
    }
}
