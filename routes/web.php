<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryItemController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\LabRequestController;
use App\Http\Controllers\LabTestController;
use App\Http\Controllers\MedicalRecordController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PetController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\SurgeryController;
use App\Http\Controllers\VaccinationController;
use App\Http\Controllers\VeterinarianController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::resource('clients', ClientController::class);
    Route::patch('clients/{client}/restore', [ClientController::class, 'restore'])->name('clients.restore')->withTrashed();

    Route::resource('pets', PetController::class);
    Route::patch('pets/{pet}/restore', [PetController::class, 'restore'])->name('pets.restore')->withTrashed();

    Route::resource('appointments', AppointmentController::class);
    Route::patch('appointments/{appointment}/restore', [AppointmentController::class, 'restore'])->name('appointments.restore')->withTrashed();

    Route::resource('medical-records', MedicalRecordController::class)->parameters([
        'medical-records' => 'medicalRecord',
    ]);
    Route::patch('medical-records/{medicalRecord}/restore', [MedicalRecordController::class, 'restore'])->name('medical-records.restore')->withTrashed();

    Route::resource('vaccinations', VaccinationController::class);
    Route::patch('vaccinations/{vaccination}/restore', [VaccinationController::class, 'restore'])->name('vaccinations.restore')->withTrashed();

    Route::resource('veterinarians', VeterinarianController::class)->only([
        'index', 'store', 'show', 'update', 'destroy',
    ]);

    Route::resource('prescriptions', PrescriptionController::class);
    Route::patch('prescriptions/{prescription}/restore', [PrescriptionController::class, 'restore'])->name('prescriptions.restore')->withTrashed();

    // Phase 3 - Advanced Modules
    Route::resource('invoices', InvoiceController::class);
    Route::patch('invoices/{invoice}/restore', [InvoiceController::class, 'restore'])->name('invoices.restore')->withTrashed();

    Route::resource('payments', PaymentController::class);

    Route::resource('inventory', InventoryItemController::class)->parameters([
        'inventory' => 'inventoryItem',
    ]);
    Route::patch('inventory/{inventoryItem}/restore', [InventoryItemController::class, 'restore'])->name('inventory.restore')->withTrashed();

    Route::resource('lab-tests', LabTestController::class)->parameters([
        'lab-tests' => 'labTest',
    ]);
    Route::patch('lab-tests/{labTest}/restore', [LabTestController::class, 'restore'])->name('lab-tests.restore')->withTrashed();

    Route::resource('lab-requests', LabRequestController::class)->parameters([
        'lab-requests' => 'labRequest',
    ]);
    Route::patch('lab-requests/{labRequest}/restore', [LabRequestController::class, 'restore'])->name('lab-requests.restore')->withTrashed();

    Route::resource('surgeries', SurgeryController::class);
    Route::patch('surgeries/{surgery}/restore', [SurgeryController::class, 'restore'])->name('surgeries.restore')->withTrashed();

    Route::get('notifications', [NotificationsController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{id}/read', [NotificationsController::class, 'markAsRead'])->name('notifications.read');
    Route::post('notifications/read-all', [NotificationsController::class, 'markAllAsRead'])->name('notifications.read-all');
});

require __DIR__.'/settings.php';
