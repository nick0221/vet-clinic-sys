<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePetRequest;
use App\Http\Requests\UpdatePetRequest;
use App\Models\Client;
use App\Models\MedicalRecord;
use App\Models\Pet;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PetController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('pets.view-any');

        $query = Pet::with('client')
            ->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('species', 'like', "%{$search}%")
                    ->orWhere('breed', 'like', "%{$search}%");
            });
        }

        $pets = $query->paginate(10);

        $clients = Client::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('pets/index', [
            'pets' => $pets,
            'clients' => $clients,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(StorePetRequest $request): RedirectResponse
    {
        $this->authorize('pets.create');

        $data = $request->validated();

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('pets', 'public');
        }

        Pet::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pet created successfully.']);

        return to_route('pets.index');
    }

    public function show(Pet $pet): Response
    {
        $this->authorize('pets.view');

        $pet->load('client');

        $medicalRecords = MedicalRecord::where('pet_id', $pet->id)
            ->with('veterinarian')
            ->latest('visit_date')
            ->take(20)
            ->get();

        return Inertia::render('pets/show', [
            'pet' => $pet,
            'medicalRecords' => $medicalRecords,
        ]);
    }

    public function update(UpdatePetRequest $request, Pet $pet): RedirectResponse
    {
        $this->authorize('pets.update');

        $data = $request->validated();

        if ($request->hasFile('photo')) {
            if ($pet->photo) {
                Storage::disk('public')->delete($pet->photo);
            }

            $data['photo'] = $request->file('photo')->store('pets', 'public');
        }

        $pet->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pet updated successfully.']);

        return to_route('pets.index');
    }

    public function destroy(Pet $pet): RedirectResponse
    {
        $this->authorize('pets.delete');

        if ($pet->photo) {
            Storage::disk('public')->delete($pet->photo);
        }

        $pet->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pet deleted successfully.']);

        return to_route('pets.index');
    }

    public function restore($id): RedirectResponse
    {
        $this->authorize('pets.restore');

        $pet = Pet::withTrashed()->findOrFail($id);
        $pet->restore();

        return redirect()->back();
    }
}
