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

        $weekStart = now()->startOfWeek();
        $weekEnd = now()->endOfWeek();
        $weekCounts = Appointment::selectRaw('date(date_time) as date, count(*) as count')
            ->whereBetween('date_time', [$weekStart, $weekEnd])
            ->groupBy('date')
            ->pluck('count', 'date');

        $revenueTrend = Payment::where('payment_date', '>=', now()->subDays(29))
            ->selectRaw('date(payment_date) as date, sum(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('total', 'date');

        $fullTrend = collect(range(29, 0, -1))->mapWithKeys(fn ($i) => [
            now()->subDays($i)->format('Y-m-d') => 0,
        ])->merge($revenueTrend);

        $topTypesThisMonth = Appointment::whereMonth('date_time', now()->month)
            ->whereYear('date_time', now()->year)
            ->selectRaw('type, count(*) as count')
            ->groupBy('type')
            ->orderByDesc('count')
            ->take(5)
            ->pluck('count', 'type');

        $speciesBreakdown = Pet::selectRaw('species, count(*) as count')
            ->groupBy('species')
            ->orderByDesc('count')
            ->pluck('count', 'species');

        $vacDueSoon = Vaccination::whereNotNull('next_due_date')
            ->where('next_due_date', '<=', now()->addDays(14))
            ->count();

        $clientApptCounts = Appointment::select('client_id')
            ->selectRaw('count(*) as total')
            ->groupBy('client_id')
            ->pluck('total', 'client_id');
        $totalClientsWithAppts = $clientApptCounts->count();
        $repeatClients = $clientApptCounts->filter(fn ($c) => $c >= 2)->count();
        $repeatClientRate = $totalClientsWithAppts > 0
            ? round($repeatClients / $totalClientsWithAppts * 100, 1)
            : 0;

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
                'vacDueSoon' => $vacDueSoon,
                'repeatClientRate' => $repeatClientRate,
            ],
            'recentClients' => $recentClients,
            'recentPets' => $recentPets,
            'upcomingAppointments' => $upcomingAppointments,
            'todaySchedule' => $todaySchedule,
            'weekCounts' => $weekCounts,
            'revenueTrend' => $fullTrend,
            'topTypesThisMonth' => $topTypesThisMonth,
            'speciesBreakdown' => $speciesBreakdown,
            'vacDueSoon' => $vacDueSoon,
            'repeatClientRate' => $repeatClientRate,
        ]);
    }
}
