<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\InventoryItem;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\LabRequest;
use App\Models\LabResult;
use App\Models\LabTest;
use App\Models\MedicalRecord;
use App\Models\Payment;
use App\Models\Pet;
use App\Models\Prescription;
use App\Models\Surgery;
use App\Models\SurgeryProcedure;
use App\Models\User;
use App\Models\Vaccination;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('PRAGMA foreign_keys = OFF');

        Payment::truncate();
        InvoiceItem::truncate();
        Invoice::truncate();
        LabResult::truncate();
        LabRequest::truncate();
        SurgeryProcedure::truncate();
        Surgery::truncate();
        Prescription::truncate();
        Vaccination::truncate();
        MedicalRecord::truncate();
        Appointment::truncate();
        Pet::truncate();
        Client::truncate();
        LabTest::truncate();
        InventoryItem::truncate();

        DB::statement('PRAGMA foreign_keys = ON');

        $vets = User::role('Veterinarian')->get();

        [$clients, $pets] = $this->seedClientsAndPets();
        $this->seedLabTests();
        $this->seedInventory();

        $appointments = $this->seedAppointments($clients, $pets, $vets);
        $medicalRecords = $this->seedMedicalRecords($pets, $vets, $appointments);

        $this->seedVaccinations($pets, $vets, $medicalRecords);
        $this->seedPrescriptions($pets, $vets, $medicalRecords);
        $this->seedSurgeries($pets, $vets, $appointments);
        $labRequests = $this->seedLabRequests($pets, $vets, $appointments);
        $this->seedLabResults($labRequests);
        $this->seedInvoices($clients, $pets, $vets, $appointments);

        $this->command->info('Sample data seeded successfully!');
    }

    private function seedClientsAndPets(): array
    {
        $clientData = [
            ['name' => 'Juan Dela Cruz', 'email' => 'juan.delacruz@email.com', 'phone' => '0917-555-1001', 'address' => '123 Rizal Avenue, Barangay Poblacion, Mandaluyong City'],
            ['name' => 'Maria Santos', 'email' => 'maria.santos@email.com', 'phone' => '0917-555-1002', 'address' => '456 Mabini Street, Barangay San Miguel, Pasig City'],
            ['name' => 'Antonio Reyes', 'email' => 'antonio.reyes@email.com', 'phone' => '0918-555-1003', 'address' => '789 Bonifacio Drive, Barangay San Antonio, Makati City'],
            ['name' => 'Elena Rodriguez', 'email' => 'elena.rodriguez@email.com', 'phone' => '0918-555-1004', 'address' => '321 Katipunan Avenue, Barangay Loyola, Quezon City'],
            ['name' => 'Ricardo Gonzales', 'email' => 'ricardo.gonzales@email.com', 'phone' => '0919-555-1005', 'address' => '654 Shaw Boulevard, Barangay Wack-Wack, Mandaluyong City'],
            ['name' => 'Catherine Lim', 'email' => 'catherine.lim@email.com', 'phone' => '0919-555-1006', 'address' => '987 Taft Avenue, Barangay Malate, Manila City'],
            ['name' => 'Miguel Fernandez', 'email' => 'miguel.fernandez@email.com', 'phone' => '0920-555-1007', 'address' => '147 Ortigas Avenue, Barangay San Juan, San Juan City'],
            ['name' => 'Sofia Villanueva', 'email' => 'sofia.villanueva@email.com', 'phone' => '0920-555-1008', 'address' => '258 Roxas Boulevard, Barangay Bangkal, Makati City'],
            ['name' => 'Jose Mercado', 'email' => 'jose.mercado@email.com', 'phone' => '0921-555-1009', 'address' => '369 Congressional Avenue, Barangay Bahay Toro, Quezon City'],
            ['name' => 'Isabella Garcia', 'email' => 'isabella.garcia@email.com', 'phone' => '0921-555-1010', 'address' => '741 Ayala Avenue, Barangay Urdaneta, Makati City'],
            ['name' => 'Pedro Santos', 'email' => 'pedro.santos@email.com', 'phone' => '0922-555-1011', 'address' => '852 Commonwealth Avenue, Barangay Old Balara, Quezon City'],
            ['name' => 'Luisa Tan', 'email' => 'luisa.tan@email.com', 'phone' => '0922-555-1012', 'address' => '963 Sct. Reyes Street, Barangay Tomas Morato, Quezon City'],
            ['name' => 'Francisco Lopez', 'email' => 'francisco.lopez@email.com', 'phone' => '0923-555-1013', 'address' => '159 Mindanao Avenue, Barangay Project 8, Quezon City'],
            ['name' => 'Angela Cruz', 'email' => 'angela.cruz@email.com', 'phone' => '0923-555-1014', 'address' => '753 EDSA, Barangay Guadalupe Nuevo, Makati City'],
            ['name' => 'Roberto Rivera', 'email' => 'roberto.rivera@email.com', 'phone' => '0925-555-1015', 'address' => '624 C5 Road, Barangay Bagong Ilog, Pasig City'],
        ];

        $petsByClient = [
            0 => [['name' => 'Max', 'species' => 'dog', 'breed' => 'Golden Retriever', 'sex' => 'male', 'color' => 'Golden', 'weight' => 35.5, 'date_of_birth' => '2020-03-15', 'notes' => 'Very friendly, loves belly rubs'],
                ['name' => 'Luna', 'species' => 'cat', 'breed' => 'Persian', 'sex' => 'female', 'color' => 'White', 'weight' => 4.2, 'date_of_birth' => '2021-07-22', 'notes' => 'Shy around strangers']],
            1 => [['name' => 'Charlie', 'species' => 'dog', 'breed' => 'Beagle', 'sex' => 'male', 'color' => 'Tri-color', 'weight' => 12.0, 'date_of_birth' => '2019-11-08', 'notes' => null],
                ['name' => 'Coco', 'species' => 'dog', 'breed' => 'Shih Tzu', 'sex' => 'female', 'color' => 'Brown & White', 'weight' => 6.5, 'date_of_birth' => '2022-01-30', 'notes' => 'Needs special diet']],
            2 => [['name' => 'Rocky', 'species' => 'dog', 'breed' => 'German Shepherd', 'sex' => 'male', 'color' => 'Black & Tan', 'weight' => 40.0, 'date_of_birth' => '2020-06-12', 'notes' => 'Protective of family'],
                ['name' => 'Mimi', 'species' => 'cat', 'breed' => 'Siamese', 'sex' => 'female', 'color' => 'Cream', 'weight' => 3.8, 'date_of_birth' => '2021-09-05', 'notes' => null]],
            3 => [['name' => 'Bella', 'species' => 'dog', 'breed' => 'Labrador Retriever', 'sex' => 'female', 'color' => 'Yellow', 'weight' => 30.2, 'date_of_birth' => '2020-12-01', 'notes' => 'Loves swimming']],
            4 => [['name' => 'Toby', 'species' => 'dog', 'breed' => 'Poodle (Miniature)', 'sex' => 'male', 'color' => 'Apricot', 'weight' => 4.5, 'date_of_birth' => '2022-06-18', 'notes' => null],
                ['name' => 'Sassy', 'species' => 'rabbit', 'breed' => 'Holland Lop', 'sex' => 'female', 'color' => 'Gray', 'weight' => 1.8, 'date_of_birth' => '2023-02-14', 'notes' => null]],
            5 => [['name' => 'Duke', 'species' => 'dog', 'breed' => 'Husky', 'sex' => 'male', 'color' => 'Gray & White', 'weight' => 28.0, 'date_of_birth' => '2021-04-20', 'notes' => 'High energy, needs lots of exercise'],
                ['name' => 'Oreo', 'species' => 'cat', 'breed' => 'Domestic Shorthair', 'sex' => 'male', 'color' => 'Black & White', 'weight' => 5.1, 'date_of_birth' => '2021-10-10', 'notes' => null]],
            6 => [['name' => 'Princess', 'species' => 'dog', 'breed' => 'Pomeranian', 'sex' => 'female', 'color' => 'Orange', 'weight' => 3.2, 'date_of_birth' => '2023-05-01', 'notes' => 'Small but feisty']],
            7 => [['name' => 'Buddy', 'species' => 'dog', 'breed' => 'Shih Tzu', 'sex' => 'male', 'color' => 'White & Gold', 'weight' => 7.0, 'date_of_birth' => '2020-09-15', 'notes' => null],
                ['name' => 'Mochi', 'species' => 'cat', 'breed' => 'Maine Coon', 'sex' => 'male', 'color' => 'Brown Tabby', 'weight' => 6.8, 'date_of_birth' => '2020-02-28', 'notes' => 'Loves being brushed']],
            8 => [['name' => 'Daisy', 'species' => 'dog', 'breed' => 'Cocker Spaniel', 'sex' => 'female', 'color' => 'Black', 'weight' => 14.5, 'date_of_birth' => '2019-08-05', 'notes' => 'Has mild anxiety']],
            9 => [['name' => 'Milo', 'species' => 'dog', 'breed' => 'French Bulldog', 'sex' => 'male', 'color' => 'Brindle', 'weight' => 12.8, 'date_of_birth' => '2021-12-12', 'notes' => null],
                ['name' => 'Pepper', 'species' => 'cat', 'breed' => 'Bengal', 'sex' => 'female', 'color' => 'Spotted', 'weight' => 4.5, 'date_of_birth' => '2022-03-25', 'notes' => 'Very active, loves climbing']],
            10 => [['name' => 'Bailey', 'species' => 'dog', 'breed' => 'Shiba Inu', 'sex' => 'male', 'color' => 'Red', 'weight' => 10.3, 'date_of_birth' => '2022-08-11', 'notes' => null]],
            11 => [['name' => 'Lucky', 'species' => 'dog', 'breed' => 'Aspin', 'sex' => 'male', 'color' => 'Brown', 'weight' => 18.0, 'date_of_birth' => '2018-05-20', 'notes' => 'Rescue dog, very loyal']],
            12 => [['name' => 'Simba', 'species' => 'cat', 'breed' => 'British Shorthair', 'sex' => 'male', 'color' => 'Blue Gray', 'weight' => 5.5, 'date_of_birth' => '2020-11-03', 'notes' => null]],
            13 => [['name' => 'Kobe', 'species' => 'dog', 'breed' => 'Rottweiler', 'sex' => 'male', 'color' => 'Black & Rust', 'weight' => 45.0, 'date_of_birth' => '2019-07-14', 'notes' => 'Very gentle with kids']],
            14 => [['name' => 'Nala', 'species' => 'dog', 'breed' => 'Dachshund', 'sex' => 'female', 'color' => 'Red', 'weight' => 9.0, 'date_of_birth' => '2021-11-30', 'notes' => null],
                ['name' => 'Ginger', 'species' => 'cat', 'breed' => 'Turkish Angora', 'sex' => 'female', 'color' => 'White & Orange', 'weight' => 3.5, 'date_of_birth' => '2022-05-09', 'notes' => null]],
        ];

        $clients = collect();
        $pets = collect();

        foreach ($clientData as $idx => $data) {
            $client = Client::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'phone' => $data['phone'],
                    'address' => $data['address'],
                    'emergency_contact_name' => fake()->name(),
                    'emergency_contact_phone' => fake()->phoneNumber(),
                    'notes' => fake()->optional(0.3)->sentence(),
                    'is_active' => true,
                ]
            );
            $clients->push($client);

            $existingPets = $client->pets()->pluck('name')->map(fn ($n) => strtolower($n))->toArray();
            foreach ($petsByClient[$idx] as $petData) {
                if (in_array(strtolower($petData['name']), $existingPets)) {
                    $pet = $client->pets()->where('name', $petData['name'])->first();
                    $pets->push($pet);

                    continue;
                }
                $pet = Pet::create([
                    'client_id' => $client->id,
                    'name' => $petData['name'],
                    'species' => $petData['species'],
                    'breed' => $petData['breed'],
                    'sex' => $petData['sex'],
                    'color' => $petData['color'],
                    'weight' => $petData['weight'],
                    'date_of_birth' => $petData['date_of_birth'],
                    'microchip_id' => fake()->unique()->regexify('[A-Z]{3}[0-9]{4}[A-Z]{4}'),
                    'notes' => $petData['notes'],
                    'is_active' => true,
                ]);
                $pets->push($pet);
            }
        }

        return [$clients, $pets];
    }

    private function seedLabTests(): void
    {
        $tests = [
            ['name' => 'Complete Blood Count (CBC)', 'category' => 'blood', 'price' => 350.00, 'description' => 'Measures red/white blood cells, platelets, hemoglobin'],
            ['name' => 'Blood Chemistry Panel', 'category' => 'blood', 'price' => 800.00, 'description' => 'Comprehensive metabolic panel including liver and kidney function'],
            ['name' => 'Heartworm Test', 'category' => 'blood', 'price' => 500.00, 'description' => 'Detects Dirofilaria immitis antigen'],
            ['name' => 'Canine Parvovirus Test', 'category' => 'blood', 'price' => 400.00, 'description' => 'Rapid antigen test for CPV detection'],
            ['name' => 'Feline Leukemia/FIV Test', 'category' => 'blood', 'price' => 600.00, 'description' => 'Combination test for FeLV and FIV'],
            ['name' => 'Urinalysis', 'category' => 'urine', 'price' => 250.00, 'description' => 'Physical, chemical, and microscopic urine examination'],
            ['name' => 'Fecal Examination', 'category' => 'microbiology', 'price' => 200.00, 'description' => 'Direct smear and flotation for intestinal parasites'],
            ['name' => 'Skin Scraping', 'category' => 'microbiology', 'price' => 300.00, 'description' => 'Microscopic examination for mites and fungal elements'],
            ['name' => 'Cytology (Fine Needle Aspirate)', 'category' => 'pathology', 'price' => 450.00, 'description' => 'Evaluation of cell morphology from mass/tissue aspirate'],
            ['name' => 'X-Ray (Radiograph)', 'category' => 'imaging', 'price' => 700.00, 'description' => 'Digital radiography of chest, abdomen, or extremities'],
            ['name' => 'Abdominal Ultrasound', 'category' => 'imaging', 'price' => 1200.00, 'description' => 'Real-time imaging of abdominal organs'],
            ['name' => 'Thyroid Profile (T4)', 'category' => 'blood', 'price' => 550.00, 'description' => 'Total thyroxine measurement for thyroid function'],
        ];

        foreach ($tests as $test) {
            LabTest::firstOrCreate(['name' => $test['name']], $test);
        }
    }

    private function seedInventory(): void
    {
        $items = [
            ['name' => 'Rabies Vaccine', 'sku' => 'SKU-VAC-001', 'category' => 'medication', 'quantity_on_hand' => 45, 'reorder_level' => 10, 'unit_price' => 100.00, 'selling_price' => 350.00, 'supplier' => 'Zoeits Animal Health', 'description' => 'Inactivated rabies vaccine for dogs and cats'],
            ['name' => 'Heartgard Plus (Small Dog)', 'sku' => 'SKU-HRT-001', 'category' => 'medication', 'quantity_on_hand' => 30, 'reorder_level' => 10, 'unit_price' => 80.00, 'selling_price' => 250.00, 'supplier' => 'Boehringer Ingelheim', 'description' => 'Monthly heartworm preventive for dogs up to 25 lbs'],
            ['name' => 'Nexgard Spectra (Medium)', 'sku' => 'SKU-NEX-001', 'category' => 'medication', 'quantity_on_hand' => 25, 'reorder_level' => 8, 'unit_price' => 140.00, 'selling_price' => 400.00, 'supplier' => 'Boehringer Ingelheim', 'description' => 'Monthly flea, tick, and worm treatment'],
            ['name' => 'Amoxicillin 500mg', 'sku' => 'SKU-AMX-001', 'category' => 'medication', 'quantity_on_hand' => 100, 'reorder_level' => 20, 'unit_price' => 15.00, 'selling_price' => 50.00, 'supplier' => 'Merck Animal Health', 'description' => 'Broad-spectrum antibiotic'],
            ['name' => 'Carprofen 100mg', 'sku' => 'SKU-CRP-001', 'category' => 'medication', 'quantity_on_hand' => 60, 'reorder_level' => 15, 'unit_price' => 20.00, 'selling_price' => 65.00, 'supplier' => 'Zoetis Animal Health', 'description' => 'NSAID for pain and inflammation'],
            ['name' => 'Elizabethan Collar (Small)', 'sku' => 'SKU-ACC-001', 'category' => 'accessories', 'quantity_on_hand' => 20, 'reorder_level' => 5, 'unit_price' => 45.00, 'selling_price' => 120.00, 'supplier' => 'KVP International', 'description' => 'Recovery collar, 8-inch diameter'],
            ['name' => 'Digital Thermometer', 'sku' => 'SKU-EQP-001', 'category' => 'equipment', 'quantity_on_hand' => 10, 'reorder_level' => 3, 'unit_price' => 150.00, 'selling_price' => 350.00, 'supplier' => 'Midmark', 'description' => 'Veterinary digital rectal thermometer'],
            ['name' => 'Royal Canin Gastrointestinal (2kg)', 'sku' => 'SKU-FOD-001', 'category' => 'food', 'quantity_on_hand' => 15, 'reorder_level' => 5, 'unit_price' => 200.00, 'selling_price' => 450.00, 'supplier' => 'Royal Canin', 'description' => 'Prescription diet for digestive issues'],
            ['name' => 'Tick Forceps', 'sku' => 'SKU-SUP-001', 'category' => 'supplies', 'quantity_on_hand' => 50, 'reorder_level' => 10, 'unit_price' => 25.00, 'selling_price' => 75.00, 'supplier' => 'Jorgensen Labs', 'description' => 'Stainless steel tick removal tweezers'],
            ['name' => 'Surgical Gloves Box (100pcs)', 'sku' => 'SKU-SUP-002', 'category' => 'supplies', 'quantity_on_hand' => 40, 'reorder_level' => 10, 'unit_price' => 85.00, 'selling_price' => 200.00, 'supplier' => 'Ansell', 'description' => 'Latex surgical gloves, size 7.5'],
            ['name' => 'IV Catheter Set (22G)', 'sku' => 'SKU-SUP-003', 'category' => 'supplies', 'quantity_on_hand' => 100, 'reorder_level' => 25, 'unit_price' => 10.00, 'selling_price' => 35.00, 'supplier' => 'BD', 'description' => '22-gauge IV catheter with injection port'],
            ['name' => 'Revolution Plus (Cat)', 'sku' => 'SKU-HRT-002', 'category' => 'medication', 'quantity_on_hand' => 20, 'reorder_level' => 5, 'unit_price' => 120.00, 'selling_price' => 380.00, 'supplier' => 'Zoetis Animal Health', 'description' => 'Monthly topical for fleas, ticks, heartworm, and intestinal parasites'],
            ['name' => 'Hill\'s Prescription Diet c/d (4kg)', 'sku' => 'SKU-FOD-002', 'category' => 'food', 'quantity_on_hand' => 10, 'reorder_level' => 3, 'unit_price' => 350.00, 'selling_price' => 750.00, 'supplier' => 'Hill\'s Pet Nutrition', 'description' => 'Urinary care prescription diet for cats'],
            ['name' => 'Wound Dressing Kit', 'sku' => 'SKU-SUP-004', 'category' => 'supplies', 'quantity_on_hand' => 30, 'reorder_level' => 8, 'unit_price' => 60.00, 'selling_price' => 150.00, 'supplier' => '3M', 'description' => 'Sterile bandage pack with gauze, tape, and antiseptic'],
            ['name' => 'Prednisone 20mg', 'sku' => 'SKU-PRD-001', 'category' => 'medication', 'quantity_on_hand' => 80, 'reorder_level' => 20, 'unit_price' => 8.00, 'selling_price' => 30.00, 'supplier' => 'Merck Animal Health', 'description' => 'Corticosteroid for inflammation and allergies'],
        ];

        foreach ($items as $item) {
            InventoryItem::firstOrCreate(['sku' => $item['sku']], $item);
        }
    }

    private function seedAppointments($clients, $pets, $vets): Collection
    {
        $now = now();
        $appointments = collect();

        $pastAppts = [
            ['pet_idx' => 0, 'client_idx' => 0, 'days_ago' => 45, 'status' => 'completed', 'reason' => 'Annual checkup and vaccination', 'type' => 'checkup', 'duration' => 30],
            ['pet_idx' => 1, 'client_idx' => 0, 'days_ago' => 30, 'status' => 'completed', 'reason' => 'Persistent sneezing and runny nose', 'type' => 'checkup', 'duration' => 30],
            ['pet_idx' => 2, 'client_idx' => 1, 'days_ago' => 60, 'status' => 'completed', 'reason' => 'Limping on right front leg', 'type' => 'checkup', 'duration' => 45],
            ['pet_idx' => 3, 'client_idx' => 1, 'days_ago' => 20, 'status' => 'completed', 'reason' => 'Skin rash and itching', 'type' => 'checkup', 'duration' => 30],
            ['pet_idx' => 4, 'client_idx' => 2, 'days_ago' => 90, 'status' => 'completed', 'reason' => 'Rabies vaccination booster', 'type' => 'vaccination', 'duration' => 15],
            ['pet_idx' => 5, 'client_idx' => 2, 'days_ago' => 15, 'status' => 'completed', 'reason' => 'Eye discharge and squinting', 'type' => 'checkup', 'duration' => 30],
            ['pet_idx' => 6, 'client_idx' => 3, 'days_ago' => 35, 'status' => 'completed', 'reason' => 'Ear infection follow-up', 'type' => 'follow_up', 'duration' => 30],
            ['pet_idx' => 8, 'client_idx' => 4, 'days_ago' => 7, 'status' => 'completed', 'reason' => 'Dental cleaning and scaling', 'type' => 'dental', 'duration' => 60],
            ['pet_idx' => 9, 'client_idx' => 5, 'days_ago' => 40, 'status' => 'completed', 'reason' => 'Vomiting after meals', 'type' => 'checkup', 'duration' => 45],
            ['pet_idx' => 10, 'client_idx' => 5, 'days_ago' => 10, 'status' => 'completed', 'reason' => 'Limping and reluctance to move', 'type' => 'checkup', 'duration' => 30],
            ['pet_idx' => 11, 'client_idx' => 6, 'days_ago' => 25, 'status' => 'completed', 'reason' => 'Annual wellness exam', 'type' => 'checkup', 'duration' => 30],
            ['pet_idx' => 12, 'client_idx' => 7, 'days_ago' => 50, 'status' => 'completed', 'reason' => 'FVRCP vaccination', 'type' => 'vaccination', 'duration' => 15],
            ['pet_idx' => 13, 'client_idx' => 7, 'days_ago' => 5, 'status' => 'completed', 'reason' => 'Urinating outside litter box', 'type' => 'checkup', 'duration' => 30],
            ['pet_idx' => 14, 'client_idx' => 8, 'days_ago' => 12, 'status' => 'completed', 'reason' => 'Coughing and wheezing', 'type' => 'checkup', 'duration' => 30],
            ['pet_idx' => 16, 'client_idx' => 9, 'days_ago' => 3, 'status' => 'completed', 'reason' => 'Neuter surgery', 'type' => 'surgery', 'duration' => 60],
            ['pet_idx' => 17, 'client_idx' => 9, 'days_ago' => 55, 'status' => 'completed', 'reason' => 'Weight loss and increased appetite', 'type' => 'checkup', 'duration' => 30],
            ['pet_idx' => 18, 'client_idx' => 10, 'days_ago' => 14, 'status' => 'completed', 'reason' => 'Hair loss and dandruff', 'type' => 'checkup', 'duration' => 30],
            ['pet_idx' => 19, 'client_idx' => 11, 'days_ago' => 42, 'status' => 'completed', 'reason' => 'Limp on rear leg', 'type' => 'checkup', 'duration' => 45],
            ['pet_idx' => 20, 'client_idx' => 12, 'days_ago' => 8, 'status' => 'completed', 'reason' => 'Check-up for diarrhea', 'type' => 'checkup', 'duration' => 30],
            ['pet_idx' => 21, 'client_idx' => 13, 'days_ago' => 21, 'status' => 'completed', 'reason' => 'Lump on left side', 'type' => 'checkup', 'duration' => 45],
        ];

        foreach ($pastAppts as $a) {
            $pet = $pets[$a['pet_idx']];
            $client = $clients[$a['client_idx']];
            $appointments->push(Appointment::create([
                'pet_id' => $pet->id,
                'client_id' => $client->id,
                'veterinarian_id' => $vets->random()->id,
                'date_time' => $now->copy()->subDays($a['days_ago'])->setTime(rand(8, 16), rand(0, 3) * 15),
                'status' => $a['status'],
                'reason' => $a['reason'],
                'notes' => fake()->optional(0.5)->sentence(),
                'duration' => $a['duration'],
                'type' => $a['type'],
            ]));
        }

        $futureReasons = [
            ['reason' => 'Follow-up on skin condition', 'type' => 'follow_up', 'duration' => 30],
            ['reason' => '3rd distemper vaccination', 'type' => 'vaccination', 'duration' => 15],
            ['reason' => 'Annual dental prophylaxis', 'type' => 'dental', 'duration' => 60],
            ['reason' => 'Wellness checkup and blood work', 'type' => 'checkup', 'duration' => 30],
            ['reason' => 'Allergy consultation', 'type' => 'checkup', 'duration' => 45],
            ['reason' => 'Boarding health certificate', 'type' => 'checkup', 'duration' => 15],
            ['reason' => 'Suture removal post-surgery', 'type' => 'follow_up', 'duration' => 15],
            ['reason' => 'GFR vaccine booster', 'type' => 'vaccination', 'duration' => 15],
        ];

        for ($i = 0; $i < count($futureReasons); $i++) {
            $pet = $pets->random();
            $r = $futureReasons[$i];
            $appointments->push(Appointment::create([
                'pet_id' => $pet->id,
                'client_id' => $pet->client_id,
                'veterinarian_id' => $vets->random()->id,
                'date_time' => $now->copy()->addDays($i * 7 + 3)->setTime(rand(9, 15), 0),
                'status' => 'scheduled',
                'reason' => $r['reason'],
                'notes' => null,
                'duration' => $r['duration'],
                'type' => $r['type'],
            ]));
        }

        $this->command->info('Created '.$appointments->count().' appointments.');

        return $appointments;
    }

    private function seedMedicalRecords($pets, $vets, $appointments): Collection
    {
        $completedAppts = $appointments->where('status', 'completed');
        $records = collect();

        $soapTemplates = [
            ['subjective' => 'Owner reports patient has been eating well and acting normally.', 'objective' => 'Physical exam unremarkable. Vital signs within normal limits.', 'assessment' => 'Healthy patient, no abnormalities detected.', 'plan' => 'Continue regular diet and exercise. Return for next scheduled vaccination.'],
            ['subjective' => 'Owner reports occasional sneezing and clear nasal discharge.', 'objective' => 'Mild serous nasal discharge noted. Temperature 38.5°C. Lungs clear on auscultation.', 'assessment' => 'Upper respiratory tract infection, likely viral.', 'plan' => 'Antibiotic therapy for 7 days. Recheck if symptoms persist beyond 10 days.'],
            ['subjective' => 'Patient has been favoring right front leg for 3 days.', 'objective' => 'Pain on palpation of right carpal joint. Mild swelling noted. Range of motion slightly decreased.', 'assessment' => 'Right carpal sprain/strain, possibly due to overexertion.', 'plan' => 'Restrict activity for 2 weeks. Prescribe anti-inflammatory medication. Recheck in 2 weeks.'],
            ['subjective' => 'Owner noticed red, itchy patches on belly and inner thighs.', 'objective' => 'Erythematous papules and pustules on ventral abdomen and medial thighs. No ectoparasites found on skin scraping.', 'assessment' => 'Superficial bacterial pyoderma, secondary to environmental allergies.', 'plan' => 'Medicated shampoo therapy twice weekly. Antibiotics for 14 days. Consider allergy testing if recurrent.'],
            ['subjective' => 'Patient\'s eye has been red with discharge for 2 days.', 'objective' => 'Conjunctival hyperemia OD. Moderate mucopurulent discharge. Corneal ulcer negative (fluorescein stain).', 'assessment' => 'Conjunctivitis, right eye.', 'plan' => 'Topical antibiotic eye drops tid for 7 days. Recheck in 1 week if not improved.'],
            ['subjective' => 'Owner reports patient shaking head and scratching left ear.', 'objective' => 'Erythematous ear canals with brown, waxy discharge. Cytology shows yeast organisms. Tympanic membrane intact.', 'assessment' => 'Otitis externa, yeast overgrowth.', 'plan' => 'Ear cleaning solution. Topical antifungal/antibiotic drops for 14 days. Recheck in 2 weeks.'],
            ['subjective' => 'Patient has been vomiting 2-3 times daily for the past 2 days.', 'objective' => 'Mild dehydration noted (skin tent ~5%). Abdomen soft, non-painful. T=38.7°C.', 'assessment' => 'Acute gastritis, likely dietary indiscretion.', 'plan' => 'GI rest for 24 hours. Start bland diet gradually. Anti-emetic injection given. Recheck if no improvement in 48 hours.'],
            ['subjective' => 'Owner reports patient is limping and slow to get up from lying down.', 'objective' => 'Stiff gait in hind limbs bilaterally. Painful on hip extension. Crepitus noted in both coxofemoral joints.', 'assessment' => 'Bilateral hip osteoarthritis.', 'plan' => 'Weight management program. Joint supplement. NSAID therapy for 14 days. Recheck pain levels in 2 weeks. Consider X-rays.'],
            ['subjective' => 'Routine wellness examination. No specific complaints.', 'objective' => 'All vital signs normal. BCS 5/9. Dentition good with minimal tartar. Heart and lungs auscultated clearly.', 'assessment' => 'Healthy adult patient.', 'plan' => 'Annual vaccinations due. Continue heartworm prevention. Schedule dental cleaning within 6 months.'],
            ['subjective' => 'Owner found a small lump on the left thoracic wall.', 'objective' => '1.5cm firm, movable subcutaneous mass on left thorax. No ulceration or discharge. No pain on palpation.', 'assessment' => 'Subcutaneous mass, likely lipoma or benign cyst. Low suspicion for malignancy based on characteristics.', 'plan' => 'Fine needle aspirate for cytology. Schedule excision if FNA inconclusive or if owner prefers removal.'],
            ['subjective' => 'Owner concerned about excessive shedding and dandruff.', 'objective' => 'Moderate scaling on dorsum. No erythema or pruritus. No ectoparasites seen on combing.', 'assessment' => 'Seborrhea sicca, nutritional or environmental factors.', 'plan' => 'Omega-3 fatty acid supplementation. Medicated shampoo weekly. Recheck in 1 month.'],
            ['subjective' => 'Owner says patient has been drinking more water and urinating frequently.', 'objective' => 'PU/PD reported. BCS 7/9. T=38.4°C. Mild dental tartar.', 'assessment' => 'Possible early renal disease or diabetes mellitus. Need blood work and urinalysis for differential diagnosis.', 'plan' => 'Fasted blood chemistry panel. Urinalysis with culture. Schedule follow-up results consultation.'],
        ];

        $soapCount = 0;
        foreach ($completedAppts as $appt) {
            $soap = $soapTemplates[$soapCount % count($soapTemplates)];
            $records->push(MedicalRecord::create([
                'pet_id' => $appt->pet_id,
                'veterinarian_id' => $appt->veterinarian_id,
                'appointment_id' => $appt->id,
                'visit_date' => $appt->date_time->format('Y-m-d'),
                'subjective' => $soap['subjective'],
                'objective' => $soap['objective'],
                'assessment' => $soap['assessment'],
                'plan' => $soap['plan'],
                'temperature' => fake()->randomFloat(1, 37.5, 39.5),
                'heart_rate' => fake()->numberBetween(70, 180),
                'respiratory_rate' => fake()->numberBetween(12, 40),
                'weight' => null,
            ]));
            $soapCount++;
        }

        $this->command->info('Created '.$records->count().' medical records.');

        return $records;
    }

    private function seedVaccinations($pets, $vets, $medicalRecords): void
    {
        $vaccineData = [
            ['pet_idx' => 0, 'vaccine' => 'Rabies', 'manufacturer' => 'Boehringer Ingelheim', 'days_ago' => 45, 'next' => '+330'],
            ['pet_idx' => 0, 'vaccine' => 'DHPP (Distemper/Parvo)', 'manufacturer' => 'Zoetis', 'days_ago' => 45, 'next' => '+320'],
            ['pet_idx' => 2, 'vaccine' => 'Rabies', 'manufacturer' => 'Boehringer Ingelheim', 'days_ago' => 60, 'next' => '+300'],
            ['pet_idx' => 2, 'vaccine' => 'Bordetella', 'manufacturer' => 'Merck', 'days_ago' => 60, 'next' => '+300'],
            ['pet_idx' => 4, 'vaccine' => 'Rabies', 'manufacturer' => 'Boehringer Ingelheim', 'days_ago' => 90, 'next' => '+275'],
            ['pet_idx' => 6, 'vaccine' => 'DHPP (Distemper/Parvo)', 'manufacturer' => 'Zoetis', 'days_ago' => 35, 'next' => '+325'],
            ['pet_idx' => 6, 'vaccine' => 'Leptospirosis', 'manufacturer' => 'Zoetis', 'days_ago' => 35, 'next' => '+325'],
            ['pet_idx' => 9, 'vaccine' => 'Rabies', 'manufacturer' => 'Boehringer Ingelheim', 'days_ago' => 40, 'next' => '+320'],
            ['pet_idx' => 11, 'vaccine' => 'FVRCP', 'manufacturer' => 'Merck', 'days_ago' => 25, 'next' => '+335'],
            ['pet_idx' => 12, 'vaccine' => 'FVRCP', 'manufacturer' => 'Merck', 'days_ago' => 50, 'next' => '+310'],
            ['pet_idx' => 12, 'vaccine' => 'FeLV', 'manufacturer' => 'Zoetis', 'days_ago' => 50, 'next' => '+310'],
            ['pet_idx' => 14, 'vaccine' => 'Rabies', 'manufacturer' => 'Boehringer Ingelheim', 'days_ago' => 12, 'next' => '+350'],
            ['pet_idx' => 14, 'vaccine' => 'DHPP (Distemper/Parvo)', 'manufacturer' => 'Zoetis', 'days_ago' => 12, 'next' => '+350'],
            ['pet_idx' => 16, 'vaccine' => 'Rabies', 'manufacturer' => 'Boehringer Ingelheim', 'days_ago' => 3, 'next' => '+357'],
            ['pet_idx' => 18, 'vaccine' => 'Rabies', 'manufacturer' => 'Boehringer Ingelheim', 'days_ago' => 14, 'next' => '+345'],
            ['pet_idx' => 19, 'vaccine' => 'DHPP (Distemper/Parvo)', 'manufacturer' => 'Zoetis', 'days_ago' => 42, 'next' => '+320'],
            ['pet_idx' => 20, 'vaccine' => 'FVRCP', 'manufacturer' => 'Merck', 'days_ago' => 8, 'next' => '+355'],
            ['pet_idx' => 20, 'vaccine' => 'Rabies', 'manufacturer' => 'Boehringer Ingelheim', 'days_ago' => 8, 'next' => '+355'],
        ];

        $now = now();
        $count = 0;
        foreach ($vaccineData as $v) {
            $pet = $pets[$v['pet_idx']];
            $administered = $now->copy()->subDays($v['days_ago']);
            Vaccination::create([
                'pet_id' => $pet->id,
                'veterinarian_id' => $vets->random()->id,
                'medical_record_id' => $medicalRecords->count() > $count ? $medicalRecords[$count]->id ?? null : null,
                'vaccine_name' => $v['vaccine'],
                'manufacturer' => $v['manufacturer'],
                'batch_number' => 'BT-'.strtoupper(fake()->bothify('####??')),
                'date_administered' => $administered->format('Y-m-d'),
                'next_due_date' => $administered->copy()->addDays((int) $v['next'])->format('Y-m-d'),
                'notes' => fake()->optional(0.3)->sentence(),
            ]);
            $count++;
        }

        $this->command->info("Created {$count} vaccinations.");
    }

    private function seedPrescriptions($pets, $vets, $medicalRecords): void
    {
        $prescriptions = [
            ['pet_idx' => 1, 'medication' => 'Amoxicillin', 'dosage' => '50mg', 'frequency' => 'twice daily', 'route' => 'oral', 'duration' => '7 days', 'quantity' => 14],
            ['pet_idx' => 3, 'medication' => 'Cephalexin', 'dosage' => '250mg', 'frequency' => 'twice daily', 'route' => 'oral', 'duration' => '14 days', 'quantity' => 28],
            ['pet_idx' => 3, 'medication' => 'Prednisone', 'dosage' => '5mg', 'frequency' => 'once daily', 'route' => 'oral', 'duration' => '10 days', 'quantity' => 10],
            ['pet_idx' => 4, 'medication' => 'Carprofen', 'dosage' => '100mg', 'frequency' => 'once daily', 'route' => 'oral', 'duration' => '7 days', 'quantity' => 7],
            ['pet_idx' => 6, 'medication' => 'Metronidazole', 'dosage' => '50mg', 'frequency' => 'twice daily', 'route' => 'oral', 'duration' => '7 days', 'quantity' => 14],
            ['pet_idx' => 7, 'medication' => 'Clindamycin', 'dosage' => '150mg', 'frequency' => 'twice daily', 'route' => 'oral', 'duration' => '10 days', 'quantity' => 20],
            ['pet_idx' => 8, 'medication' => 'Gabapentin', 'dosage' => '100mg', 'frequency' => 'twice daily', 'route' => 'oral', 'duration' => '14 days', 'quantity' => 28],
            ['pet_idx' => 8, 'medication' => 'Carprofen', 'dosage' => '100mg', 'frequency' => 'once daily', 'route' => 'oral', 'duration' => '5 days', 'quantity' => 5],
            ['pet_idx' => 9, 'medication' => 'Maropitant', 'dosage' => '16mg', 'frequency' => 'once daily', 'route' => 'oral', 'duration' => '4 days', 'quantity' => 4],
            ['pet_idx' => 14, 'medication' => 'Doxycycline', 'dosage' => '100mg', 'frequency' => 'once daily', 'route' => 'oral', 'duration' => '14 days', 'quantity' => 14],
            ['pet_idx' => 16, 'medication' => 'Gabapentin', 'dosage' => '50mg', 'frequency' => 'twice daily', 'route' => 'oral', 'duration' => '5 days', 'quantity' => 10],
            ['pet_idx' => 18, 'medication' => 'Omega-3 Fatty Acids', 'dosage' => '1000mg', 'frequency' => 'once daily', 'route' => 'oral', 'duration' => '30 days', 'quantity' => 30],
            ['pet_idx' => 19, 'medication' => 'Carprofen', 'dosage' => '50mg', 'frequency' => 'once daily', 'route' => 'oral', 'duration' => '7 days', 'quantity' => 7],
            ['pet_idx' => 20, 'medication' => 'Metronidazole', 'dosage' => '25mg', 'frequency' => 'twice daily', 'route' => 'oral', 'duration' => '5 days', 'quantity' => 10],
        ];

        $count = 0;
        foreach ($prescriptions as $p) {
            $pet = $pets[$p['pet_idx']];
            Prescription::create([
                'pet_id' => $pet->id,
                'veterinarian_id' => $vets->random()->id,
                'medical_record_id' => $medicalRecords->count() > $count ? $medicalRecords[$count]->id ?? null : null,
                'medication_name' => $p['medication'],
                'dosage' => $p['dosage'],
                'frequency' => $p['frequency'],
                'route' => $p['route'],
                'duration' => $p['duration'],
                'quantity' => $p['quantity'],
                'refills' => fake()->optional(0.3)->numberBetween(0, 2),
                'notes' => fake()->optional(0.4)->sentence(),
                'start_date' => now()->subDays($count * 3 + 5)->format('Y-m-d'),
                'end_date' => fake()->optional(0.6)->dateTimeBetween('now', '+1 month'),
            ]);
            $count++;
        }

        $this->command->info("Created {$count} prescriptions.");
    }

    private function seedSurgeries($pets, $vets, $appointments): void
    {
        $surgeries = [
            ['pet_idx' => 4, 'name' => 'Dental Cleaning', 'days_ago' => 90, 'status' => 'completed', 'procedures' => ['Oral examination and charting', 'Supragingival scaling', 'Subgingival scaling', 'Polishing', 'Fluoride treatment']],
            ['pet_idx' => 7, 'name' => 'Spay (Ovariohysterectomy)', 'days_ago' => 60, 'status' => 'completed', 'procedures' => ['Pre-anesthetic induction', 'Ovariohysterectomy', 'Three-layer closure', 'Recovery monitoring']],
            ['pet_idx' => 16, 'name' => 'Neuter (Castration)', 'days_ago' => 3, 'status' => 'completed', 'procedures' => ['Pre-anesthetic induction', 'Bilateral orchiectomy', 'Skin closure', 'Recovery monitoring']],
            ['pet_idx' => 21, 'name' => 'Mass Removal', 'days_ago' => 21, 'status' => 'completed', 'procedures' => ['Surgical site preparation', 'Mass excision with margins', 'Hemostasis', 'Subcutaneous closure', 'Skin suture placement']],
        ];

        $now = now();
        foreach ($surgeries as $s) {
            $pet = $pets[$s['pet_idx']];
            $surgery = Surgery::create([
                'pet_id' => $pet->id,
                'veterinarian_id' => $vets->random()->id,
                'appointment_id' => $appointments->where('pet_id', $pet->id)->first()?->id,
                'surgery_name' => $s['name'],
                'description' => fake()->sentence(),
                'scheduled_date' => $now->copy()->subDays($s['days_ago']),
                'start_time' => '09:00:00',
                'end_time' => '10:30:00',
                'status' => $s['status'],
                'notes' => fake()->optional(0.5)->sentence(),
            ]);

            foreach ($s['procedures'] as $procedure) {
                SurgeryProcedure::create([
                    'surgery_id' => $surgery->id,
                    'procedure_name' => $procedure,
                    'description' => fake()->optional(0.3)->sentence(),
                    'notes' => null,
                ]);
            }
        }

        $this->command->info('Created '.count($surgeries).' surgeries with procedures.');
    }

    private function seedLabRequests($pets, $vets, $appointments): Collection
    {
        $labTests = LabTest::all();

        $requestData = [
            ['pet_idx' => 0, 'test_idx' => 1, 'days_ago' => 45, 'status' => 'completed'],
            ['pet_idx' => 6, 'test_idx' => 0, 'days_ago' => 35, 'status' => 'completed'],
            ['pet_idx' => 9, 'test_idx' => 2, 'days_ago' => 40, 'status' => 'completed'],
            ['pet_idx' => 9, 'test_idx' => 6, 'days_ago' => 40, 'status' => 'completed'],
            ['pet_idx' => 11, 'test_idx' => 9, 'days_ago' => 50, 'status' => 'completed'],
            ['pet_idx' => 14, 'test_idx' => 0, 'days_ago' => 12, 'status' => 'completed'],
            ['pet_idx' => 14, 'test_idx' => 1, 'days_ago' => 12, 'status' => 'completed'],
            ['pet_idx' => 17, 'test_idx' => 5, 'days_ago' => 55, 'status' => 'completed'],
            ['pet_idx' => 18, 'test_idx' => 7, 'days_ago' => 14, 'status' => 'completed'],
            ['pet_idx' => 20, 'test_idx' => 6, 'days_ago' => 8, 'status' => 'completed'],
            ['pet_idx' => 21, 'test_idx' => 8, 'days_ago' => 21, 'status' => 'completed'],
            ['pet_idx' => 21, 'test_idx' => 10, 'days_ago' => 21, 'status' => 'completed'],
        ];

        $now = now();
        $labRequests = collect();

        foreach ($requestData as $r) {
            $pet = $pets[$r['pet_idx']];
            $labRequests->push(LabRequest::create([
                'pet_id' => $pet->id,
                'veterinarian_id' => $vets->random()->id,
                'appointment_id' => $appointments->where('pet_id', $pet->id)->first()?->id,
                'lab_test_id' => $labTests[$r['test_idx']]->id,
                'request_date' => $now->copy()->subDays($r['days_ago']),
                'status' => $r['status'],
                'notes' => fake()->optional(0.4)->sentence(),
            ]));
        }

        $this->command->info('Created '.$labRequests->count().' lab requests.');

        return $labRequests;
    }

    private function seedLabResults($labRequests): void
    {
        $resultsByCategory = [
            'blood' => [
                ['parameter' => 'WBC', 'value' => '12.5', 'reference_range' => '6.0-17.0 x10^9/L'],
                ['parameter' => 'RBC', 'value' => '6.8', 'reference_range' => '5.5-8.5 x10^12/L'],
                ['parameter' => 'Hemoglobin', 'value' => '15.2', 'reference_range' => '12.0-18.0 g/dL'],
                ['parameter' => 'Hematocrit', 'value' => '45', 'reference_range' => '37-55%'],
                ['parameter' => 'Platelets', 'value' => '250', 'reference_range' => '200-500 x10^9/L'],
                ['parameter' => 'ALT', 'value' => '45', 'reference_range' => '10-100 U/L'],
                ['parameter' => 'BUN', 'value' => '22', 'reference_range' => '7-27 mg/dL'],
                ['parameter' => 'Creatinine', 'value' => '1.0', 'reference_range' => '0.5-1.5 mg/dL'],
            ],
            'urine' => [
                ['parameter' => 'Color', 'value' => 'Yellow', 'reference_range' => 'Light to dark yellow'],
                ['parameter' => 'Turbidity', 'value' => 'Clear', 'reference_range' => 'Clear'],
                ['parameter' => 'Specific Gravity', 'value' => '1.025', 'reference_range' => '1.015-1.045'],
                ['parameter' => 'pH', 'value' => '6.5', 'reference_range' => '5.5-7.5'],
                ['parameter' => 'Protein', 'value' => 'Negative', 'reference_range' => 'Negative'],
                ['parameter' => 'Glucose', 'value' => 'Negative', 'reference_range' => 'Negative'],
            ],
            'microbiology' => [
                ['parameter' => 'Parasite Identification', 'value' => 'Negative', 'reference_range' => 'Negative'],
                ['parameter' => 'Ova Detection', 'value' => 'Negative', 'reference_range' => 'Negative'],
            ],
            'pathology' => [
                ['parameter' => 'Cell Morphology', 'value' => 'Benign epithelial cells', 'reference_range' => 'N/A'],
                ['parameter' => 'Inflammatory Cells', 'value' => 'Few', 'reference_range' => 'Few'],
            ],
            'imaging' => [
                ['parameter' => 'Findings', 'value' => 'Normal', 'reference_range' => 'N/A'],
            ],
        ];

        foreach ($labRequests as $request) {
            $test = $request->labTest;
            $results = $resultsByCategory[$test->category] ?? $resultsByCategory['blood'];

            foreach (array_slice($results, 0, fake()->numberBetween(3, count($results))) as $result) {
                LabResult::create([
                    'lab_request_id' => $request->id,
                    'parameter' => $result['parameter'],
                    'value' => $result['value'],
                    'reference_range' => $result['reference_range'],
                    'notes' => fake()->optional(0.2)->sentence(),
                ]);
            }
        }
    }

    private function seedInvoices($clients, $pets, $vets, $appointments): void
    {
        $invoices = [
            ['client_idx' => 0, 'pet_idx' => 0, 'appt_idx' => 0, 'status' => 'paid', 'items' => [
                ['desc' => 'Annual Wellness Exam', 'qty' => 1, 'unit_price' => 500, 'type' => 'service'],
                ['desc' => 'Rabies Vaccination', 'qty' => 1, 'unit_price' => 350, 'type' => 'service'],
                ['desc' => 'Heartgard Plus (Small Dog) - 1 month', 'qty' => 1, 'unit_price' => 250, 'type' => 'product'],
            ]],
            ['client_idx' => 1, 'pet_idx' => 2, 'appt_idx' => 2, 'status' => 'paid', 'items' => [
                ['desc' => 'Consultation - Limping', 'qty' => 1, 'unit_price' => 400, 'type' => 'service'],
                ['desc' => 'X-Ray (Right Front Leg)', 'qty' => 1, 'unit_price' => 700, 'type' => 'service'],
                ['desc' => 'Carprofen 100mg (7 tablets)', 'qty' => 1, 'unit_price' => 180, 'type' => 'product'],
            ]],
            ['client_idx' => 2, 'pet_idx' => 4, 'appt_idx' => 4, 'status' => 'paid', 'items' => [
                ['desc' => 'Dental Scaling & Polishing', 'qty' => 1, 'unit_price' => 1200, 'type' => 'service'],
                ['desc' => 'Pre-anesthetic Blood Panel', 'qty' => 1, 'unit_price' => 800, 'type' => 'service'],
                ['desc' => 'Anesthesia Monitoring', 'qty' => 1, 'unit_price' => 500, 'type' => 'service'],
            ]],
            ['client_idx' => 3, 'pet_idx' => 6, 'appt_idx' => 6, 'status' => 'paid', 'items' => [
                ['desc' => 'Follow-up Consultation (Ear Infection)', 'qty' => 1, 'unit_price' => 350, 'type' => 'service'],
                ['desc' => 'Ear Cleaning Solution', 'qty' => 1, 'unit_price' => 150, 'type' => 'product'],
                ['desc' => 'Otomax Ear Drops', 'qty' => 1, 'unit_price' => 280, 'type' => 'product'],
            ]],
            ['client_idx' => 5, 'pet_idx' => 9, 'appt_idx' => 9, 'status' => 'paid', 'items' => [
                ['desc' => 'Emergency Consultation', 'qty' => 1, 'unit_price' => 600, 'type' => 'service'],
                ['desc' => 'Blood Chemistry Panel', 'qty' => 1, 'unit_price' => 800, 'type' => 'service'],
                ['desc' => 'Fecal Examination', 'qty' => 1, 'unit_price' => 200, 'type' => 'service'],
                ['desc' => 'Anti-emetic Injection', 'qty' => 1, 'unit_price' => 250, 'type' => 'service'],
            ]],
            ['client_idx' => 7, 'pet_idx' => 12, 'appt_idx' => 12, 'status' => 'paid', 'items' => [
                ['desc' => 'Consultation - Urinary Issue', 'qty' => 1, 'unit_price' => 400, 'type' => 'service'],
                ['desc' => 'Urinalysis', 'qty' => 1, 'unit_price' => 250, 'type' => 'service'],
                ['desc' => 'Hill\'s Prescription Diet c/d (4kg)', 'qty' => 1, 'unit_price' => 750, 'type' => 'product'],
            ]],
            ['client_idx' => 9, 'pet_idx' => 16, 'appt_idx' => 15, 'status' => 'paid', 'items' => [
                ['desc' => 'Neuter Surgery (Castration)', 'qty' => 1, 'unit_price' => 2500, 'type' => 'service'],
                ['desc' => 'Pre-anesthetic Blood Panel', 'qty' => 1, 'unit_price' => 800, 'type' => 'service'],
                ['desc' => 'IV Catheter Set', 'qty' => 1, 'unit_price' => 35, 'type' => 'product'],
                ['desc' => 'Elizabethan Collar', 'qty' => 1, 'unit_price' => 120, 'type' => 'product'],
            ]],
            ['client_idx' => 8, 'pet_idx' => 14, 'appt_idx' => 14, 'status' => 'pending', 'items' => [
                ['desc' => 'Consultation - Coughing', 'qty' => 1, 'unit_price' => 400, 'type' => 'service'],
                ['desc' => 'Chest X-Ray', 'qty' => 1, 'unit_price' => 700, 'type' => 'service'],
                ['desc' => 'Doxycycline 100mg (14 tablets)', 'qty' => 1, 'unit_price' => 280, 'type' => 'product'],
            ]],
            ['client_idx' => 12, 'pet_idx' => 20, 'appt_idx' => 19, 'status' => 'pending', 'items' => [
                ['desc' => 'Consultation - Diarrhea', 'qty' => 1, 'unit_price' => 400, 'type' => 'service'],
                ['desc' => 'Fecal Examination', 'qty' => 1, 'unit_price' => 200, 'type' => 'service'],
                ['desc' => 'Metronidazole 25mg (10 tablets)', 'qty' => 1, 'unit_price' => 150, 'type' => 'product'],
            ]],
        ];

        $now = now();
        foreach ($invoices as $idx => $inv) {
            $client = $clients[$inv['client_idx']];
            $pet = $pets[$inv['pet_idx']];
            $appointment = $appointments[$inv['appt_idx']] ?? null;

            $subtotal = 0;
            $invoiceItems = [];
            foreach ($inv['items'] as $item) {
                $total = $item['qty'] * $item['unit_price'];
                $subtotal += $total;
                $invoiceItems[] = [
                    'description' => $item['desc'],
                    'quantity' => $item['qty'],
                    'unit_price' => $item['unit_price'],
                    'total' => $total,
                    'type' => $item['type'],
                ];
            }

            $tax = round($subtotal * 0.12, 2);
            $total = $subtotal + $tax;

            $invoice = Invoice::create([
                'client_id' => $client->id,
                'pet_id' => $pet->id,
                'appointment_id' => $appointment?->id,
                'veterinarian_id' => $vets->random()->id,
                'invoice_number' => 'INV-'.str_pad($idx + 1, 7, '0', STR_PAD_LEFT),
                'subtotal' => $subtotal,
                'tax' => $tax,
                'total' => $total,
                'status' => $inv['status'],
                'due_date' => $now->copy()->addDays(30),
            ]);

            foreach ($invoiceItems as $item) {
                InvoiceItem::create(array_merge($item, ['invoice_id' => $invoice->id]));
            }

            if ($inv['status'] === 'paid') {
                Payment::create([
                    'invoice_id' => $invoice->id,
                    'amount' => $total,
                    'payment_method' => fake()->randomElement(['cash', 'card', 'bank_transfer']),
                    'payment_date' => $invoice->created_at->addDays(rand(0, 7)),
                    'reference' => fake()->optional(0.5)->bothify('PAY-#######'),
                ]);
            }
        }

        $this->command->info('Created '.count($invoices).' invoices.');
    }
}
