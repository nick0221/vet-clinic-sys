<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\InventoryItem;
use App\Models\Invoice;
use App\Models\LabRequest;
use App\Models\Payment;
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

        $todayRevenue = Payment::whereDate('payment_date', today())
            ->sum('amount');

        $monthRevenue = Payment::whereMonth('payment_date', now()->month)
            ->whereYear('payment_date', now()->year)
            ->sum('amount');

        $outstandingRevenue = Invoice::whereIn('status', ['pending', 'overdue'])
            ->sum('total');

        $overdueInvoices = Invoice::where('status', 'overdue')
            ->orWhere(function ($q) {
                $q->where('status', 'pending')
                    ->where('due_date', '<', now());
            })
            ->count();

        $recentClients = Client::latest()->take(5)->get();
        $recentPets = Pet::with('client')->latest()->take(5)->get();
        $todaySchedule = Appointment::with(['pet', 'client', 'veterinarian'])
            ->whereDate('date_time', today())
            ->orderBy('date_time')
            ->get();

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
                'todayRevenue' => $todayRevenue,
                'monthRevenue' => $monthRevenue,
                'outstandingRevenue' => $outstandingRevenue,
                'overdueInvoices' => $overdueInvoices,
            ],
            'recentClients' => $recentClients,
            'recentPets' => $recentPets,
            'upcomingAppointments' => $upcomingAppointments,
            'todaySchedule' => $todaySchedule,
        ]);
    }
}
