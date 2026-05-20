<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\InventoryItem;
use App\Models\Invoice;
use App\Models\LabRequest;
use App\Models\Pet;
use App\Models\Surgery;
use App\Models\Vaccination;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $this->authorize('dashboard.view');

        $totalClients = Client::count();
        $totalPets = Pet::count();
        $todayAppointments = Appointment::whereDate('date_time', today())->count();
        $upcomingVaccinations = Vaccination::whereNotNull('next_due_date')
            ->where('next_due_date', '<=', now()->addDays(30))
            ->count();
        $pendingInvoices = Invoice::whereIn('status', ['draft', 'pending'])->count();
        $lowStockItems = InventoryItem::whereColumn('quantity_on_hand', '<=', 'reorder_level')->count();
        $pendingLabRequests = LabRequest::whereIn('status', ['pending', 'collected'])->count();
        $todaySurgeries = Surgery::whereDate('scheduled_date', today())->count();

        $recentClients = Client::latest()->take(5)->get();
        $recentPets = Pet::with('client')->latest()->take(5)->get();
        $upcomingAppointments = Appointment::with(['pet', 'client', 'veterinarian'])
            ->where('date_time', '>=', now())
            ->orderBy('date_time')
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'totalClients' => $totalClients,
                'totalPets' => $totalPets,
                'todayAppointments' => $todayAppointments,
                'upcomingVaccinations' => $upcomingVaccinations,
                'pendingInvoices' => $pendingInvoices,
                'lowStockItems' => $lowStockItems,
                'pendingLabRequests' => $pendingLabRequests,
                'todaySurgeries' => $todaySurgeries,
            ],
            'recentClients' => $recentClients,
            'recentPets' => $recentPets,
            'upcomingAppointments' => $upcomingAppointments,
        ]);
    }
}
