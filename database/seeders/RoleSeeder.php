<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $modules = ['clients', 'pets', 'appointments', 'medical-records', 'vaccinations', 'prescriptions', 'invoices', 'payments', 'inventory', 'lab-tests', 'lab-requests', 'surgeries', 'veterinarians'];

        Permission::firstOrCreate(['name' => 'dashboard.view']);
        Permission::firstOrCreate(['name' => 'settings.view']);

        foreach ($modules as $module) {
            foreach (['view-any', 'view', 'create', 'update', 'delete', 'restore'] as $action) {
                Permission::firstOrCreate(['name' => "{$module}.{$action}"]);
            }
        }

        $admin = Role::firstOrCreate(['name' => 'Admin']);
        $admin->syncPermissions(Permission::all());

        $veterinarian = Role::firstOrCreate(['name' => 'Veterinarian']);
        $veterinarian->syncPermissions([
            'dashboard.view', 'settings.view',
            'clients.view-any', 'clients.view', 'clients.create', 'clients.update',
            'pets.view-any', 'pets.view', 'pets.create', 'pets.update',
            'appointments.view-any', 'appointments.view', 'appointments.create', 'appointments.update',
            'medical-records.view-any', 'medical-records.view', 'medical-records.create', 'medical-records.update',
            'vaccinations.view-any', 'vaccinations.view', 'vaccinations.create', 'vaccinations.update',
            'prescriptions.view-any', 'prescriptions.view', 'prescriptions.create', 'prescriptions.update',
            'invoices.view-any', 'invoices.view',
            'payments.view-any', 'payments.view',
            'inventory.view-any', 'inventory.view',
            'lab-tests.view-any', 'lab-tests.view',
            'lab-requests.view-any', 'lab-requests.view', 'lab-requests.create', 'lab-requests.update',
            'surgeries.view-any', 'surgeries.view', 'surgeries.create', 'surgeries.update',
            'veterinarians.view-any', 'veterinarians.view',
        ]);

        $receptionist = Role::firstOrCreate(['name' => 'Receptionist']);
        $receptionist->syncPermissions([
            'dashboard.view', 'settings.view',
            'clients.view-any', 'clients.view', 'clients.create', 'clients.update', 'clients.delete',
            'pets.view-any', 'pets.view', 'pets.create', 'pets.update', 'pets.delete',
            'appointments.view-any', 'appointments.view', 'appointments.create', 'appointments.update', 'appointments.delete',
            'medical-records.view-any', 'medical-records.view',
            'vaccinations.view-any', 'vaccinations.view',
            'prescriptions.view-any', 'prescriptions.view',
            'invoices.view-any', 'invoices.view', 'invoices.create', 'invoices.update',
            'payments.view-any', 'payments.view', 'payments.create',
            'inventory.view-any', 'inventory.view',
            'lab-tests.view-any', 'lab-tests.view',
            'lab-requests.view-any', 'lab-requests.view',
            'surgeries.view-any', 'surgeries.view',
            'veterinarians.view-any', 'veterinarians.view',
        ]);

        $assistant = Role::firstOrCreate(['name' => 'Assistant']);
        $assistant->syncPermissions([
            'dashboard.view', 'settings.view',
            'clients.view-any', 'clients.view', 'clients.create', 'clients.update',
            'pets.view-any', 'pets.view', 'pets.create', 'pets.update',
            'appointments.view-any', 'appointments.view', 'appointments.update',
            'medical-records.view-any', 'medical-records.view', 'medical-records.create', 'medical-records.update',
            'vaccinations.view-any', 'vaccinations.view', 'vaccinations.create', 'vaccinations.update',
            'prescriptions.view-any', 'prescriptions.view', 'prescriptions.create', 'prescriptions.update',
            'invoices.view-any', 'invoices.view',
            'payments.view-any', 'payments.view',
            'inventory.view-any', 'inventory.view',
            'lab-tests.view-any', 'lab-tests.view',
            'lab-requests.view-any', 'lab-requests.view', 'lab-requests.update',
            'surgeries.view-any', 'surgeries.view', 'surgeries.update',
            'veterinarians.view-any', 'veterinarians.view',
        ]);

        $petOwner = Role::firstOrCreate(['name' => 'Pet Owner']);
        $petOwner->syncPermissions([
            'dashboard.view', 'settings.view',
            'clients.view-any', 'clients.view',
            'pets.view-any', 'pets.view',
            'appointments.view-any', 'appointments.view',
            'medical-records.view-any', 'medical-records.view',
            'vaccinations.view-any', 'vaccinations.view',
            'prescriptions.view-any', 'prescriptions.view',
            'invoices.view-any', 'invoices.view',
        ]);

        if (! User::where('email', 'admin@vetclinic.test')->exists()) {
            User::factory()->create([
                'name' => 'Admin User',
                'email' => 'admin@vetclinic.test',
            ])->assignRole($admin);
        }
    }
}
