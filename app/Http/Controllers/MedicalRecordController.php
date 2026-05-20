<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMedicalRecordRequest;
use App\Http\Requests\UpdateMedicalRecordRequest;
use App\Models\MedicalRecord;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MedicalRecordController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('medical-records.view-any');

        $query = MedicalRecord::with(['pet', 'veterinarian'])
            ->orderBy('visit_date', 'desc');

        if ($request->filled('pet_id')) {
            $query->where('pet_id', $request->pet_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('assessment', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhere('subjective', 'like', "%{$search}%");
            });
        }

        $records = $query->paginate(10);

        $pets = Pet::with('client')->where('is_active', true)->get(['id', 'name', 'client_id']);
        $veterinarians = User::role('Veterinarian')->get(['id', 'name']);

        return Inertia::render('medical-records/index', [
            'records' => $records,
            'pets' => $pets,
            'veterinarians' => $veterinarians,
            'filters' => $request->only(['pet_id', 'search']),
        ]);
    }

    public function store(StoreMedicalRecordRequest $request): RedirectResponse
    {
        $this->authorize('medical-records.create');

        MedicalRecord::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Medical record created successfully.']);

        return to_route('medical-records.index');
    }

    public function show(MedicalRecord $medicalRecord): Response
    {
        $this->authorize('medical-records.view');

        $medicalRecord->load(['pet', 'veterinarian', 'appointment', 'vaccinations', 'prescriptions']);

        return Inertia::render('medical-records/show', [
            'record' => $medicalRecord,
        ]);
    }

    public function update(UpdateMedicalRecordRequest $request, MedicalRecord $medicalRecord): RedirectResponse
    {
        $this->authorize('medical-records.update');

        $medicalRecord->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Medical record updated successfully.']);

        return to_route('medical-records.index');
    }

    public function destroy(MedicalRecord $medicalRecord): RedirectResponse
    {
        $this->authorize('medical-records.delete');

        $medicalRecord->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Medical record deleted successfully.']);

        return to_route('medical-records.index');
    }

    public function restore($id): RedirectResponse
    {
        $this->authorize('medical-records.restore');

        $record = MedicalRecord::withTrashed()->findOrFail($id);
        $record->restore();

        return redirect()->back();
    }
}
