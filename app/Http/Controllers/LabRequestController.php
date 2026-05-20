<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLabRequestRequest;
use App\Http\Requests\UpdateLabRequestRequest;
use App\Models\LabRequest;
use App\Models\LabTest;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabRequestController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('lab-requests.view-any');

        $query = LabRequest::with(['pet', 'labTest', 'veterinarian']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('notes', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $labRequests = $query->latest()->paginate(10);

        return Inertia::render('lab-requests/index', [
            'labRequests' => $labRequests,
            'pets' => Pet::select('id', 'name')->get(),
            'labTests' => LabTest::select('id', 'name')->get(),
            'veterinarians' => User::role('Veterinarian')->get(['id', 'name']),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(StoreLabRequestRequest $request)
    {
        $this->authorize('lab-requests.create');

        LabRequest::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Lab request created successfully.']);

        return redirect()->back();
    }

    public function show(LabRequest $labRequest)
    {
        $this->authorize('lab-requests.view');

        $labRequest->load(['pet', 'veterinarian', 'labTest', 'results']);

        return Inertia::render('lab-requests/show', [
            'labRequest' => $labRequest,
        ]);
    }

    public function update(UpdateLabRequestRequest $request, LabRequest $labRequest)
    {
        $this->authorize('lab-requests.update');

        $labRequest->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Lab request updated successfully.']);

        return redirect()->back();
    }

    public function destroy(LabRequest $labRequest)
    {
        $this->authorize('lab-requests.delete');

        $labRequest->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Lab request deleted successfully.']);

        return redirect()->back();
    }

    public function restore($id)
    {
        $this->authorize('lab-requests.restore');

        $labRequest = LabRequest::withTrashed()->findOrFail($id);
        $labRequest->restore();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Lab request restored successfully.']);

        return redirect()->back();
    }
}
