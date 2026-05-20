<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePrescriptionRequest;
use App\Http\Requests\UpdatePrescriptionRequest;
use App\Models\Pet;
use App\Models\Prescription;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PrescriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('prescriptions.view-any');

        $query = Prescription::with(['pet', 'veterinarian'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('pet_id')) {
            $query->where('pet_id', $request->pet_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('medication_name', 'like', "%{$search}%")
                    ->orWhere('dosage', 'like', "%{$search}%");
            });
        }

        $prescriptions = $query->paginate(10);

        $pets = Pet::with('client')->where('is_active', true)->get(['id', 'name', 'client_id']);
        $veterinarians = User::role('Veterinarian')->get(['id', 'name']);

        return Inertia::render('prescriptions/index', [
            'prescriptions' => $prescriptions,
            'pets' => $pets,
            'veterinarians' => $veterinarians,
            'filters' => $request->only(['pet_id', 'search']),
        ]);
    }

    public function store(StorePrescriptionRequest $request): RedirectResponse
    {
        $this->authorize('prescriptions.create');

        Prescription::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Prescription created successfully.']);

        return to_route('prescriptions.index');
    }

    public function show(Prescription $prescription): Response
    {
        $this->authorize('prescriptions.view');

        $prescription->load(['pet', 'veterinarian', 'medicalRecord']);

        return Inertia::render('prescriptions/show', [
            'prescription' => $prescription,
        ]);
    }

    public function update(UpdatePrescriptionRequest $request, Prescription $prescription): RedirectResponse
    {
        $this->authorize('prescriptions.update');

        $prescription->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Prescription updated successfully.']);

        return to_route('prescriptions.index');
    }

    public function destroy(Prescription $prescription): RedirectResponse
    {
        $this->authorize('prescriptions.delete');

        $prescription->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Prescription deleted successfully.']);

        return to_route('prescriptions.index');
    }

    public function restore($id): RedirectResponse
    {
        $this->authorize('prescriptions.restore');

        $prescription = Prescription::withTrashed()->findOrFail($id);
        $prescription->restore();

        return redirect()->back();
    }
}
