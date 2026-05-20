<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVaccinationRequest;
use App\Http\Requests\UpdateVaccinationRequest;
use App\Models\Pet;
use App\Models\User;
use App\Models\Vaccination;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VaccinationController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('vaccinations.view-any');

        $query = Vaccination::with(['pet', 'veterinarian'])
            ->orderBy('date_administered', 'desc');

        if ($request->filled('pet_id')) {
            $query->where('pet_id', $request->pet_id);
        }

        if ($request->filled('overdue')) {
            $query->where('next_due_date', '<', now())->whereNotNull('next_due_date');
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('vaccine_name', 'like', "%{$search}%")
                    ->orWhere('batch_number', 'like', "%{$search}%");
            });
        }

        $vaccinations = $query->paginate(10);

        $pets = Pet::with('client')->where('is_active', true)->get(['id', 'name', 'client_id']);
        $veterinarians = User::role('Veterinarian')->get(['id', 'name']);

        return Inertia::render('vaccinations/index', [
            'vaccinations' => $vaccinations,
            'pets' => $pets,
            'veterinarians' => $veterinarians,
            'filters' => $request->only(['pet_id', 'overdue', 'search']),
        ]);
    }

    public function store(StoreVaccinationRequest $request): RedirectResponse
    {
        $this->authorize('vaccinations.create');

        Vaccination::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Vaccination recorded successfully.']);

        return to_route('vaccinations.index');
    }

    public function show(Vaccination $vaccination): Response
    {
        $this->authorize('vaccinations.view');

        $vaccination->load(['pet', 'veterinarian', 'medicalRecord']);

        return Inertia::render('vaccinations/show', [
            'vaccination' => $vaccination,
        ]);
    }

    public function update(UpdateVaccinationRequest $request, Vaccination $vaccination): RedirectResponse
    {
        $this->authorize('vaccinations.update');

        $vaccination->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Vaccination updated successfully.']);

        return to_route('vaccinations.index');
    }

    public function destroy(Vaccination $vaccination): RedirectResponse
    {
        $this->authorize('vaccinations.delete');

        $vaccination->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Vaccination deleted successfully.']);

        return to_route('vaccinations.index');
    }

    public function restore($id): RedirectResponse
    {
        $this->authorize('vaccinations.restore');

        $vaccination = Vaccination::withTrashed()->findOrFail($id);
        $vaccination->restore();

        return redirect()->back();
    }
}
