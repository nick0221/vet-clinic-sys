<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVeterinarianRequest;
use App\Http\Requests\UpdateVeterinarianRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class VeterinarianController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('veterinarians.view-any');

        $query = User::role('Veterinarian');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $veterinarians = $query->latest()->paginate(10);

        return Inertia::render('veterinarians/index', [
            'veterinarians' => $veterinarians,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(StoreVeterinarianRequest $request)
    {
        $this->authorize('veterinarians.create');

        $user = User::create($request->validated());
        $user->assignRole('Veterinarian');

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Veterinarian created successfully.']);

        return redirect()->back();
    }

    public function show(User $veterinarian)
    {
        $this->authorize('veterinarians.view');

        if (! $veterinarian->hasRole('Veterinarian')) {
            abort(404);
        }

        $veterinarian->load('permissions');

        return Inertia::render('veterinarians/show', [
            'veterinarian' => $veterinarian,
        ]);
    }

    public function update(UpdateVeterinarianRequest $request, User $veterinarian)
    {
        $this->authorize('veterinarians.update');

        if (! $veterinarian->hasRole('Veterinarian')) {
            abort(404);
        }

        $veterinarian->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Veterinarian updated successfully.']);

        return redirect()->back();
    }

    public function destroy(Request $request, User $veterinarian)
    {
        $this->authorize('veterinarians.delete');

        if (! $veterinarian->hasRole('Veterinarian')) {
            abort(404);
        }

        if ($veterinarian->id === $request->user()->id) {
            throw ValidationException::withMessages(['veterinarian' => 'You cannot delete yourself.']);
        }

        $veterinarian->removeRole('Veterinarian');

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Veterinarian deleted successfully.']);

        return redirect()->back();
    }
}
