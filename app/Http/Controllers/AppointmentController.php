<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\UpdateAppointmentRequest;
use App\Models\Activity;
use App\Models\Appointment;
use App\Models\Client;
use App\Models\MedicalRecord;
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

        $calMonth = $request->integer('cal_month', now()->month);
        $calYear = $request->integer('cal_year', now()->year);

        $calendarCounts = Appointment::selectRaw('date(date_time) as date, count(*) as count')
            ->whereYear('date_time', $calYear)
            ->whereMonth('date_time', $calMonth)
            ->groupBy('date')
            ->pluck('count', 'date');

        return Inertia::render('appointments/index', [
            'appointments' => $appointments,
            'veterinarians' => $veterinarians,
            'pets' => $pets,
            'clients' => $clients,
            'filters' => $request->only(['status', 'date_from', 'date_to', 'search']),
            'calendarCounts' => $calendarCounts,
            'calendarMonth' => $calMonth,
            'calendarYear' => $calYear,
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

        $appointment->load(['pet.client', 'client', 'veterinarian']);

        $medicalRecords = MedicalRecord::where('pet_id', $appointment->pet_id)
            ->with('veterinarian')
            ->latest('visit_date')
            ->take(5)
            ->get();

        $activity = Activity::where('subject_type', Appointment::class)
            ->where('subject_id', $appointment->id)
            ->with('user')
            ->latest()
            ->get();

        return Inertia::render('appointments/show', [
            'appointment' => $appointment,
            'medicalRecords' => $medicalRecords,
            'activity' => $activity,
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
