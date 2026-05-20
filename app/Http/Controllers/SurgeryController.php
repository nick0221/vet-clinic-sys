<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSurgeryRequest;
use App\Http\Requests\UpdateSurgeryRequest;
use App\Models\Pet;
use App\Models\Surgery;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SurgeryController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('surgeries.view-any');

        $query = Surgery::with(['pet', 'veterinarian']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('surgery_name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $surgeries = $query->latest()->paginate(10);

        return Inertia::render('surgeries/index', [
            'surgeries' => $surgeries,
            'pets' => Pet::select('id', 'name')->get(),
            'veterinarians' => User::role('Veterinarian')->get(['id', 'name']),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(StoreSurgeryRequest $request)
    {
        $this->authorize('surgeries.create');

        Surgery::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Surgery scheduled successfully.']);

        return redirect()->back();
    }

    public function show(Surgery $surgery)
    {
        $this->authorize('surgeries.view');

        $surgery->load(['pet', 'veterinarian', 'procedures']);

        return Inertia::render('surgeries/show', [
            'surgery' => $surgery,
        ]);
    }

    public function update(UpdateSurgeryRequest $request, Surgery $surgery)
    {
        $this->authorize('surgeries.update');

        $surgery->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Surgery updated successfully.']);

        return redirect()->back();
    }

    public function destroy(Surgery $surgery)
    {
        $this->authorize('surgeries.delete');

        $surgery->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Surgery cancelled successfully.']);

        return redirect()->back();
    }

    public function restore($id)
    {
        $this->authorize('surgeries.restore');

        $surgery = Surgery::withTrashed()->findOrFail($id);
        $surgery->restore();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Surgery restored successfully.']);

        return redirect()->back();
    }
}
