<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLabTestRequest;
use App\Http\Requests\UpdateLabTestRequest;
use App\Models\LabTest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabTestController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('lab-tests.view-any');

        $query = LabTest::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active === '1');
        }

        $labTests = $query->latest()->paginate(10);

        return Inertia::render('lab-tests/index', [
            'labTests' => $labTests,
            'filters' => $request->only(['search', 'is_active']),
        ]);
    }

    public function store(StoreLabTestRequest $request)
    {
        $this->authorize('lab-tests.create');

        LabTest::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Lab test created successfully.']);

        return redirect()->back();
    }

    public function show(LabTest $labTest)
    {
        $this->authorize('lab-tests.view');

        return Inertia::render('lab-tests/show', [
            'labTest' => $labTest,
        ]);
    }

    public function update(UpdateLabTestRequest $request, LabTest $labTest)
    {
        $this->authorize('lab-tests.update');

        $labTest->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Lab test updated successfully.']);

        return redirect()->back();
    }

    public function destroy(LabTest $labTest)
    {
        $this->authorize('lab-tests.delete');

        $labTest->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Lab test deleted successfully.']);

        return redirect()->back();
    }

    public function restore($id)
    {
        $this->authorize('lab-tests.restore');

        $labTest = LabTest::withTrashed()->findOrFail($id);
        $labTest->restore();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Lab test restored successfully.']);

        return redirect()->back();
    }
}
