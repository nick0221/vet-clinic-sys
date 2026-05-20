<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class VeterinarianSeeder extends Seeder
{
    public function run(): void
    {
        $vets = [
            [
                'name' => 'Dr. Sarah Mitchell',
                'email' => 'sarah@vetclinic.test',
                'phone' => '0917-555-0101',
                'specialization' => 'Small Animal Surgery',
                'license_number' => 'VET-2018-00421',
                'bio' => 'Dr. Mitchell graduated from the University of Veterinary Medicine with honors. She has over 8 years of experience in small animal surgery and orthopedics.',
                'address' => '45 Maple Street, Barangay San Antonio, Makati City',
                'emergency_contact' => '0917-555-0199',
                'start_date' => '2018-06-15',
                'notes' => 'Available for emergency surgeries on weekends.',
            ],
            [
                'name' => 'Dr. James Reyes',
                'email' => 'james@vetclinic.test',
                'phone' => '0918-555-0202',
                'specialization' => 'Veterinary Dentistry & Oral Surgery',
                'license_number' => 'VET-2019-00512',
                'bio' => 'A specialist in veterinary dentistry with advanced training in oral surgery and dental radiology. Dr. Reyes is passionate about improving pet oral health.',
                'address' => '88 Quezon Avenue, Diliman, Quezon City',
                'emergency_contact' => '0918-555-0299',
                'start_date' => '2019-03-01',
                'notes' => 'Fluent in English and Filipino. Offers dental cleaning packages.',
            ],
            [
                'name' => 'Dr. Maria Lopez',
                'email' => 'maria@vetclinic.test',
                'phone' => '0919-555-0303',
                'specialization' => 'Internal Medicine',
                'license_number' => 'VET-2017-00389',
                'bio' => 'Dr. Lopez specializes in diagnosing and treating complex internal medical conditions. She has published several papers on canine gastroenterology.',
                'address' => '12 Rizal Street, Barangay Poblacion, Mandaluyong City',
                'emergency_contact' => '0919-555-0399',
                'start_date' => '2017-11-20',
                'notes' => 'Prefers morning appointments for complex cases.',
            ],
            [
                'name' => 'Dr. Antonio Cruz',
                'email' => 'antonio@vetclinic.test',
                'phone' => '0920-555-0404',
                'specialization' => 'Emergency & Critical Care',
                'license_number' => 'VET-2020-00678',
                'bio' => 'Board-certified in emergency and critical care. Dr. Cruz leads the after-hours emergency team and has extensive experience in trauma management.',
                'address' => '23 Market Avenue, Barangay San Lorenzo, Makati City',
                'emergency_contact' => '0920-555-0499',
                'start_date' => '2020-01-10',
                'notes' => 'On-call for emergencies 24/7. Rotating weekend schedule.',
            ],
            [
                'name' => 'Dr. Patricia Santos',
                'email' => 'patricia@vetclinic.test',
                'phone' => '0921-555-0505',
                'specialization' => 'Exotic Pets & Avian Medicine',
                'license_number' => 'VET-2021-00734',
                'bio' => 'One of the few specialists in exotic pet medicine in the region. Dr. Santos has a particular interest in avian surgery and reptile husbandry.',
                'address' => '67 Park Avenue, Barangay San Juan, San Juan City',
                'emergency_contact' => '0921-555-0599',
                'start_date' => '2021-07-05',
                'notes' => 'Consultation by appointment only for exotic pets. Bring prior medical records.',
            ],
            [
                'name' => 'Dr. Carlos Mendoza',
                'email' => 'carlos@vetclinic.test',
                'phone' => '0922-555-0606',
                'specialization' => 'Dermatology & Allergy',
                'license_number' => 'VET-2022-00891',
                'bio' => 'Dr. Mendoza is a certified veterinary dermatologist. He helps pets with chronic skin conditions, allergies, and autoimmune disorders.',
                'address' => '154 Banawe Street, Barangay St. Peter, Quezon City',
                'emergency_contact' => '0922-555-0699',
                'start_date' => '2022-04-18',
                'notes' => 'Allergy testing available on Wednesdays and Fridays.',
            ],
        ];

        foreach ($vets as $vet) {
            $user = User::firstOrCreate(
                ['email' => $vet['email']],
                [
                    'name' => $vet['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'phone' => $vet['phone'],
                    'specialization' => $vet['specialization'],
                    'license_number' => $vet['license_number'],
                    'bio' => $vet['bio'],
                    'address' => $vet['address'],
                    'emergency_contact' => $vet['emergency_contact'],
                    'start_date' => $vet['start_date'],
                    'notes' => $vet['notes'],
                ],
            );

            if (! $user->hasRole('Veterinarian')) {
                $user->assignRole('Veterinarian');
            }
        }

        $this->command->info('Created ' . count($vets) . ' sample veterinarians.');
    }
}
