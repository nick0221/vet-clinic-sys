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
use Illuminate\Support\Facades\DB;
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

        // Stat trends (current vs prior period growth rate)
        $startMonth = now()->startOfMonth();
        $startLastMonth = now()->subMonth()->startOfMonth();
        $endLastMonth = now()->subMonth()->endOfMonth();
        $yesterday = now()->subDay()->startOfDay();
        $growthRate = fn ($current, $previous) => $previous > 0 ? round(($current - $previous) / $previous * 100, 1) : null;

        $prevMonthRevenue = Payment::whereMonth('payment_date', now()->subMonth()->month)
            ->whereYear('payment_date', now()->subMonth()->year)
            ->sum('amount');

        $trends = [
            'clients' => $growthRate(
                Client::where('created_at', '>=', $startMonth)->count(),
                Client::whereBetween('created_at', [$startLastMonth, $endLastMonth])->count(),
            ),
            'pets' => $growthRate(
                Pet::where('created_at', '>=', $startMonth)->count(),
                Pet::whereBetween('created_at', [$startLastMonth, $endLastMonth])->count(),
            ),
            'todayAppointments' => $growthRate(
                $todayAppointments,
                Appointment::whereDate('date_time', $yesterday)->count(),
            ),
            'todayRevenue' => $growthRate(
                $todayRevenue,
                Payment::whereDate('payment_date', $yesterday)->sum('amount'),
            ),
            'monthRevenue' => $growthRate($monthRevenue, $prevMonthRevenue),
            'pendingInvoices' => $pendingInvoices > 0 && ($prevPending = Invoice::whereIn('status', ['draft', 'pending'])
                ->whereBetween('created_at', [$startLastMonth, $endLastMonth])->count()) > 0
                ? round(($pendingInvoices - $prevPending) / $prevPending * 100, 1)
                : null,
        ];

        // No-show / cancellation rate this month
        $monthApptsTotal = Appointment::whereMonth('date_time', now()->month)
            ->whereYear('date_time', now()->year)
            ->count();
        $monthCancelled = Appointment::whereMonth('date_time', now()->month)
            ->whereYear('date_time', now()->year)
            ->whereIn('status', ['cancelled', 'no_show'])
            ->count();
        $cancellationRate = $monthApptsTotal > 0
            ? round($monthCancelled / $monthApptsTotal * 100, 1)
            : 0;

        // Inventory expiring within 30 days
        $expiringInventory = InventoryItem::whereNotNull('expiry_date')
            ->where('expiry_date', '<=', now()->addDays(30))
            ->where('expiry_date', '>=', today())
            ->where('is_active', true)
            ->orderBy('expiry_date')
            ->take(10)
            ->get(['id', 'name', 'sku', 'quantity_on_hand', 'expiry_date', 'selling_price']);

        // Veterinarian workload today
        $vetWorkload = Appointment::whereDate('date_time', today())
            ->with('veterinarian:id,name')
            ->get()
            ->groupBy(fn ($a) => $a->veterinarian->name)
            ->map(fn ($group) => $group->count())
            ->sortDesc()
            ->take(6);

        // Peak hours: appointments per day-of-week × hour (last 90 days)
        $peakHours = Appointment::where('date_time', '>=', now()->subDays(90))
            ->selectRaw("strftime('%w', date_time) as day, cast(strftime('%H', date_time) as integer) as hour, count(*) as count")
            ->groupBy('day', 'hour')
            ->orderBy('day')
            ->orderBy('hour')
            ->get()
            ->map(fn ($r) => ['day' => (int) $r->day, 'hour' => $r->hour, 'count' => $r->count]);

        // Average revenue per appointment type
        $avgRevenueByType = DB::table('appointments')
            ->join('invoices', 'appointments.id', '=', 'invoices.appointment_id')
            ->join('payments', 'invoices.id', '=', 'payments.invoice_id')
            ->select('appointments.type', DB::raw('avg(payments.amount) as avg_amount'))
            ->groupBy('appointments.type')
            ->orderByDesc('avg_amount')
            ->get()
            ->map(fn ($r) => ['type' => $r->type, 'avg_amount' => round((float) $r->avg_amount, 2)]);

        // New client trend (12 weeks)
        $weeklyClients = collect(range(11, 0, -1))->mapWithKeys(fn ($i) => [
            now()->subWeeks($i)->startOfWeek()->format('Y-m-d') => 0,
        ])->merge(
            Client::where('created_at', '>=', now()->subWeeks(11)->startOfWeek())
                ->selectRaw("date(created_at, 'weekday 0', '-6 days') as week_start, count(*) as count")
                ->groupBy('week_start')
                ->orderBy('week_start')
                ->pluck('count', 'week_start')
        );

        // Patient age pyramid
        $now = now();
        $agePyramid = Pet::selectRaw("
            case
                when julianday('$now') - julianday(date_of_birth) < 365 then 'Junior'
                when julianday('$now') - julianday(date_of_birth) < 2555 then 'Adult'
                else 'Senior'
            end as age_group, count(*) as count
        ")->whereNotNull('date_of_birth')
            ->groupBy('age_group')
            ->orderByRaw("min(julianday('$now') - julianday(date_of_birth))")
            ->pluck('count', 'age_group');

        $appointmentTypeLabels = [
            'checkup' => 'Checkup',
            'consultation' => 'Consultation',
            'vaccination' => 'Vaccination',
            'surgery' => 'Surgery',
            'dental' => 'Dental',
            'emergency' => 'Emergency',
            'follow_up' => 'Follow-up',
            'grooming' => 'Grooming',
        ];

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
            'trends' => $trends,
            'cancellationRate' => $cancellationRate,
            'expiringInventory' => $expiringInventory,
            'vetWorkload' => $vetWorkload,
            'peakHours' => $peakHours,
            'avgRevenueByType' => $avgRevenueByType,
            'weeklyClients' => $weeklyClients,
            'agePyramid' => $agePyramid,
            'appointmentTypeLabels' => $appointmentTypeLabels,
        ]);
    }
}
