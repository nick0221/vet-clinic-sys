<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\UpdateAppointmentRequest;
use App\Models\Appointment;
use App\Models\Client;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('appointments.view-any');

        $query = Appointment::with(['pet', 'client', 'veterinarian'])
            ->orderBy('date_time', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('date_time', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('date_time', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('type', 'like', "%{$search}%")
                    ->orWhere('reason', 'like', "%{$search}%");
            });
        }

        $appointments = $query->paginate(15);

        $veterinarians = User::role('Veterinarian')->get(['id', 'name']);
        $pets = Pet::with('client')->where('is_active', true)->get(['id', 'name', 'client_id']);
        $clients = Client::where('is_active', true)->get(['id', 'name']);

        return Inertia::render('appointments/index', [
            'appointments' => $appointments,
            'veterinarians' => $veterinarians,
            'pets' => $pets,
            'clients' => $clients,
            'filters' => $request->only(['status', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function store(StoreAppointmentRequest $request): RedirectResponse
    {
        $this->authorize('appointments.create');

        Appointment::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Appointment created successfully.']);

        return to_route('appointments.index');
    }

    public function show(Appointment $appointment): Response
    {
        $this->authorize('appointments.view');

        $appointment->load(['pet', 'client', 'veterinarian']);

        return Inertia::render('appointments/show', [
            'appointment' => $appointment,
        ]);
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment): RedirectResponse
    {
        $this->authorize('appointments.update');

        $appointment->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Appointment updated successfully.']);

        return to_route('appointments.index');
    }

    public function destroy(Appointment $appointment): RedirectResponse
    {
        $this->authorize('appointments.delete');

        $appointment->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Appointment cancelled successfully.']);

        return to_route('appointments.index');
    }

    public function restore($id): RedirectResponse
    {
        $this->authorize('appointments.restore');

        $appointment = Appointment::withTrashed()->findOrFail($id);
        $appointment->restore();

        return redirect()->back();
    }
}
