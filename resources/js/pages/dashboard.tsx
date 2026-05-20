import * as React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    Banknote,
    BarChart3,
    Calendar,
    Clock,
    Dna,
    LayoutDashboard,
    Package,
    PawPrint,
    Plus,
    Repeat,
    Syringe,
    Timer,
    TrendingUp,
    Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { dashboard } from '@/routes';
import appointmentsRoute from '@/routes/appointments';
import clients from '@/routes/clients';
import invoices from '@/routes/invoices';
import pets from '@/routes/pets';
import inventory from '@/routes/inventory';
import labRequests from '@/routes/lab-requests';
import surgeries from '@/routes/surgeries';
import vaccinations from '@/routes/vaccinations';
import { formatDate } from '@/lib/utils';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

interface Client {
    id: number;
    name: string;
    email: string;
}

interface Pet {
    id: number;
    name: string;
    species: string;
    client: { id: number; name: string };
}

interface Appointment {
    id: number;
    date_time: string;
    status: string;
    type: string;
    reason: string;
    pet: { id: number; name: string };
    client: { id: number; name: string };
    veterinarian: { id: number; name: string };
}

interface VetWorkloadItem {
    name: string;
    count: number;
}

interface ExpiringItem {
    id: number;
    name: string;
    sku: string;
    quantity_on_hand: number;
    expiry_date: string;
    selling_price: number;
}

interface DashboardProps {
    stats: {
        totalClients: number;
        totalPets: number;
        todayAppointments: number;
        upcomingVaccinations: number;
        pendingInvoices: number;
        lowStockItems: number;
        pendingLabRequests: number;
        todaySurgeries: number;
        todayRevenue: number;
        monthRevenue: number;
        outstandingRevenue: number;
        overdueInvoices: number;
        vacDueSoon: number;
        repeatClientRate: number;
    };
    recentClients: Client[];
    recentPets: Pet[];
    upcomingAppointments: Appointment[];
    todaySchedule: Appointment[];
    weekCounts: Record<string, number>;
    revenueTrend: Record<string, number>;
    topTypesThisMonth: Record<string, number>;
    speciesBreakdown: Record<string, number>;
    trends: Record<string, number | null>;
    cancellationRate: number;
    expiringInventory: ExpiringItem[];
    vetWorkload: Record<string, number>;
}

function statusColor(status: string) {
    const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        scheduled: 'outline',
        confirmed: 'default',
        in_progress: 'default',
        completed: 'secondary',
        cancelled: 'destructive',
        no_show: 'destructive',
    };
    return map[status] ?? 'outline';
}

function formatCurrency(val: number | string): string {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return '$' + num.toFixed(2);
}

function TrendBadge({ value, inverse }: { value: number | null | undefined; inverse?: boolean }) {
    if (value === null || value === undefined) return null;
    const isUp = value > 0;
    const isDown = value < 0;
    const color = inverse
        ? (isUp ? 'text-red-600' : isDown ? 'text-green-600' : 'text-muted-foreground')
        : (isUp ? 'text-green-600' : isDown ? 'text-red-600' : 'text-muted-foreground');
    const icon = isUp ? <ArrowUp className="h-3 w-3" /> : isDown ? <ArrowDown className="h-3 w-3" /> : null;
    return (
        <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${color}`}>
            {icon}
            {Math.abs(value).toFixed(1)}%
        </span>
    );
}

export default function Dashboard({ stats, recentClients, recentPets, upcomingAppointments, todaySchedule, weekCounts, revenueTrend, topTypesThisMonth, speciesBreakdown, trends, cancellationRate, expiringInventory, vetWorkload }: DashboardProps) {
    const [tab, setTab] = React.useState('overview');
    const hasAlerts = stats.lowStockItems > 0 || stats.overdueInvoices > 0 || stats.pendingLabRequests > 0;

    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    const weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayStr = today.toISOString().slice(0, 10);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dateStr = d.toISOString().slice(0, 10);
        return { label: weekDayLabels[i], date: dateStr, count: weekCounts[dateStr] ?? 0, isToday: dateStr === todayStr };
    });

    const typeCounts: Record<string, string> = {
        checkup: 'Checkup',
        consultation: 'Consultation',
        vaccination: 'Vaccination',
        surgery: 'Surgery',
        dental: 'Dental',
        emergency: 'Emergency',
        follow_up: 'Follow-up',
        grooming: 'Grooming',
    };
    const todayTypeCounts: Record<string, number> = {};
    todaySchedule.forEach((apt) => {
        todayTypeCounts[apt.type] = (todayTypeCounts[apt.type] ?? 0) + 1;
    });
    const todayTypes = Object.entries(todayTypeCounts).sort((a, b) => b[1] - a[1]);

    return (
        <>
            <Head title="Dashboard">
                <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        .dashboard-print, .dashboard-print * { visibility: visible; }
                        .dashboard-print { position: absolute; left: 0; top: 0; width: 100%; }
                        .no-print { display: none !important; }
                        .print-only { display: block !important; }
                    }
                    .print-only { display: none; }
                `}</style>
            </Head>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
                        <p className="text-sm text-muted-foreground">{formatDate(new Date().toISOString())}</p>
                    </div>
                    <div className="no-print flex items-center gap-2">
                        <Link href={appointmentsRoute.index()}>
                            <Button variant="outline" size="sm"><Plus /> Book Appointment</Button>
                        </Link>
                        <Link href={clients.index()}>
                            <Button variant="outline" size="sm"><Plus /> Add Client</Button>
                        </Link>
                    </div>
                </div>

                {hasAlerts && (
                    <Card className="no-print border-amber-200 bg-amber-50">
                        <CardContent className="flex flex-wrap items-center gap-4 py-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            {stats.lowStockItems > 0 && (
                                <Link href={inventory.index()} className="text-sm text-amber-800 hover:underline">
                                    {stats.lowStockItems} item{stats.lowStockItems > 1 ? 's' : ''} low on stock
                                </Link>
                            )}
                            {stats.overdueInvoices > 0 && (
                                <Link href={invoices.index()} className="text-sm text-amber-800 hover:underline">
                                    {stats.overdueInvoices} overdue invoice{stats.overdueInvoices > 1 ? 's' : ''}
                                </Link>
                            )}
                            {stats.pendingLabRequests > 0 && (
                                <Link href={labRequests.index()} className="text-sm text-amber-800 hover:underline">
                                    {stats.pendingLabRequests} pending lab request{stats.pendingLabRequests > 1 ? 's' : ''}
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList className="no-print">
                        <TabsTrigger value="overview"><LayoutDashboard className="h-4 w-4" /> Overview</TabsTrigger>
                        <TabsTrigger value="schedule"><Calendar className="h-4 w-4" /> Schedule</TabsTrigger>
                        <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4" /> Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="dashboard-print">
                        <div className="flex items-center gap-3 overflow-x-auto pb-2">
                            {weekDays.map((d) => (
                                <div
                                    key={d.date}
                                    className={`flex min-w-[72px] flex-col items-center gap-1 rounded-lg border px-3 py-2 text-center ${
                                        d.isToday ? 'border-primary bg-primary/5' : 'border-border'
                                    }`}
                                >
                                    <span className="text-xs text-muted-foreground">{d.label}</span>
                                    <span className={`text-lg font-bold ${d.isToday ? 'text-primary' : ''}`}>
                                        {d.count}
                                    </span>
                                    {d.isToday && <span className="text-[10px] font-medium text-primary">Today</span>}
                                </div>
                            ))}
                        </div>

                        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                            <Link href={clients.index()}>
                                <Card className="transition-colors hover:bg-accent/50">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.totalClients}</div>
                                        <TrendBadge value={trends.clients} />
                                    </CardContent>
                                </Card>
                            </Link>
                            <Link href={pets.index()}>
                                <Card className="transition-colors hover:bg-accent/50">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
                                        <PawPrint className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.totalPets}</div>
                                        <TrendBadge value={trends.pets} />
                                    </CardContent>
                                </Card>
                            </Link>
                            <Link href={appointmentsRoute.index()}>
                                <Card className="transition-colors hover:bg-accent/50">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.todayAppointments}</div>
                                        <TrendBadge value={trends.todayAppointments} />
                                    </CardContent>
                                </Card>
                            </Link>
                            <Link href={vaccinations.index()}>
                                <Card className="transition-colors hover:bg-accent/50">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Upcoming Vaccinations</CardTitle>
                                        <Syringe className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.upcomingVaccinations}</div>
                                        <p className="text-xs text-muted-foreground">Due within 30 days</p>
                                    </CardContent>
                                </Card>
                            </Link>
                            <Link href={invoices.index()}>
                                <Card className="transition-colors hover:bg-accent/50">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                                        <Banknote className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{formatCurrency(stats.todayRevenue)}</div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{formatCurrency(stats.monthRevenue)} this month</span>
                                            <TrendBadge value={trends.monthRevenue} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                            <Link href={invoices.index()}>
                                <Card className="transition-colors hover:bg-accent/50">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                                        <Banknote className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{formatCurrency(stats.outstandingRevenue)}</div>
                                        <p className="text-xs text-muted-foreground">{stats.pendingInvoices} pending invoices</p>
                                    </CardContent>
                                </Card>
                            </Link>
                            <Link href={labRequests.index()}>
                                <Card className="transition-colors hover:bg-accent/50">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Pending Lab</CardTitle>
                                        <Dna className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.pendingLabRequests}</div>
                                    </CardContent>
                                </Card>
                            </Link>
                            <Link href={surgeries.index()}>
                                <Card className="transition-colors hover:bg-accent/50">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Today's Surgeries</CardTitle>
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.todaySurgeries}</div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Card className="flex-1 min-w-[180px]">
                                <CardContent className="flex items-center gap-3 py-3">
                                    <Timer className="h-5 w-5 text-muted-foreground shrink-0" />
                                    <div>
                                        <div className="text-xl font-bold">{cancellationRate}%</div>
                                        <p className="text-xs text-muted-foreground">Cancellation / no-show rate</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="flex-1 min-w-[180px]">
                                <CardContent className="flex items-center gap-3 py-3">
                                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                                    <div>
                                        <div className="text-xl font-bold">{stats.pendingInvoices}</div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <span>Pending invoices</span>
                                            <TrendBadge value={trends.pendingInvoices} inverse />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="schedule" className="no-print">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Today's Schedule</CardTitle>
                                        <Link href={appointmentsRoute.index()}>
                                            <Button variant="ghost" size="sm">View All</Button>
                                        </Link>
                                    </div>
                                    {todayTypes.length > 0 && (
                                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                            {todayTypes.map(([type, count]) => (
                                                <Badge key={type} variant="secondary" className="text-[11px]">
                                                    {typeCounts[type] ?? type} ({count})
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    {todaySchedule.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No appointments scheduled for today.</p>
                                    ) : (
                                        <div className="space-y-0">
                                            {todaySchedule.map((apt, i) => {
                                                const time = apt.date_time.includes('T') ? apt.date_time.split('T')[1].slice(0, 5) : '';
                                                return (
                                                    <div key={apt.id} className="relative flex gap-4 pb-4 pl-8 last:pb-0">
                                                        {i < todaySchedule.length - 1 && (
                                                            <div className="absolute left-[13px] top-6 h-full w-px bg-border" />
                                                        )}
                                                        <div className={`absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold
                                                            ${apt.status === 'completed' ? 'border-green-500 bg-green-50 text-green-700' :
                                                              apt.status === 'cancelled' || apt.status === 'no_show' ? 'border-red-500 bg-red-50 text-red-700' :
                                                              apt.status === 'in_progress' ? 'border-blue-500 bg-blue-50 text-blue-700' :
                                                              'border-muted-foreground/30 bg-background text-muted-foreground'}`}>
                                                            <Clock className="h-3 w-3" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <Link href={appointmentsRoute.show(apt.id)} className="text-sm font-medium hover:underline truncate">
                                                                    {apt.pet.name}
                                                                </Link>
                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    {time && <span className="text-xs tabular-nums text-muted-foreground">{time}</span>}
                                                                    <Badge variant={statusColor(apt.status)} className="text-[10px] px-1.5 py-0">
                                                                        {apt.status.replace('_', ' ')}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground truncate">{apt.reason}</p>
                                                            <p className="text-xs text-muted-foreground">{apt.client.name} · {apt.veterinarian.name}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Upcoming</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {upcomingAppointments.length === 0 && (
                                                <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
                                            )}
                                            {upcomingAppointments.map((apt) => (
                                                <div key={apt.id} className="flex items-center justify-between">
                                                    <div className="min-w-0">
                                                        <Link
                                                            href={appointmentsRoute.show(apt.id)}
                                                            className="text-sm font-medium hover:underline truncate block"
                                                        >
                                                            {apt.pet.name}
                                                        </Link>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {apt.client.name} — {formatDate(apt.date_time)}
                                                        </p>
                                                    </div>
                                                    <Badge variant={statusColor(apt.status)} className="shrink-0 ml-2">
                                                        {apt.status.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Recent Clients</CardTitle>
                                            <Link href={clients.index()}>
                                                <Button variant="ghost" size="sm">All</Button>
                                            </Link>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {recentClients.length === 0 && (
                                                <p className="text-sm text-muted-foreground">No clients yet.</p>
                                            )}
                                            {recentClients.map((client) => (
                                                <div key={client.id}>
                                                    <Link
                                                        href={clients.show(client.id)}
                                                        className="text-sm font-medium hover:underline"
                                                    >
                                                        {client.name}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Recent Patients</CardTitle>
                                            <Link href={pets.index()}>
                                                <Button variant="ghost" size="sm">All</Button>
                                            </Link>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {recentPets.length === 0 && (
                                                <p className="text-sm text-muted-foreground">No pets registered yet.</p>
                                            )}
                                            {recentPets.map((pet) => (
                                                <div key={pet.id}>
                                                    <Link
                                                        href={pets.show(pet.id)}
                                                        className="text-sm font-medium hover:underline"
                                                    >
                                                        {pet.name}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {pet.species} — {pet.client.name}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-sm">
                                            <Clock className="h-4 w-4" />
                                            Today's Vet Workload
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {Object.keys(vetWorkload).length === 0 ? (
                                            <p className="text-sm text-muted-foreground">No appointments today.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {Object.entries(vetWorkload).map(([name, count]) => (
                                                    <div key={name} className="flex items-center justify-between">
                                                        <span className="text-sm">{name}</span>
                                                        <Badge variant="secondary">{count} appt{count > 1 ? 's' : ''}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="no-print">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4" />
                                            Revenue Trend (30 days)
                                        </CardTitle>
                                        <span className="text-sm text-muted-foreground">
                                            {formatCurrency(stats.monthRevenue)} this month
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={Object.entries(revenueTrend).map(([date, total]) => ({ date, total }))}>
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(val: string) => {
                                                    const d = new Date(val + 'T00:00:00');
                                                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                                }}
                                                fontSize={11}
                                                tickLine={false}
                                                axisLine={false}
                                                interval="preserveStartEnd"
                                            />
                                            <YAxis hide />
                                            <Tooltip
                                                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                                                labelFormatter={(label: string) => formatDate(label)}
                                                contentStyle={{ fontSize: 13 }}
                                            />
                                            <Bar dataKey="total" radius={[3, 3, 0, 0]} maxBarSize={20}>
                                                {Object.entries(revenueTrend).map(([_, total]) => (
                                                    <Cell key={_} fill={total > 0 ? '#16a34a' : '#e5e7eb'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">Top Appointment Types</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {Object.entries(topTypesThisMonth).length === 0 && (
                                            <p className="text-sm text-muted-foreground">No appointments this month.</p>
                                        )}
                                        {Object.entries(topTypesThisMonth).map(([type, count]) => {
                                            const maxCount = Math.max(...Object.values(topTypesThisMonth));
                                            return (
                                                <div key={type} className="flex items-center gap-3">
                                                    <span className="w-24 truncate text-sm">{typeCounts[type] ?? type}</span>
                                                    <div className="flex-1 h-2 rounded-full bg-muted">
                                                        <div
                                                            className="h-2 rounded-full bg-primary"
                                                            style={{ width: `${(count / maxCount) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium tabular-nums">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">Patients by Species</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {Object.entries(speciesBreakdown).map(([species, count], _, arr) => {
                                            const total = arr.reduce((s, [, c]) => s + c, 0);
                                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                                            const colors: Record<string, string> = {
                                                Dog: 'bg-blue-500',
                                                Cat: 'bg-orange-500',
                                                Bird: 'bg-green-500',
                                                Rabbit: 'bg-purple-500',
                                                Other: 'bg-gray-400',
                                            };
                                            return (
                                                <div key={species} className="flex items-center gap-3">
                                                    <span className="w-20 text-sm">{species}</span>
                                                    <div className="flex-1 h-2 rounded-full bg-muted">
                                                        <div
                                                            className={`h-2 rounded-full ${colors[species] ?? 'bg-gray-400'}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium tabular-nums">{count}</span>
                                                    <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
                                                </div>
                                            );
                                        })}
                                    </CardContent>
                                </Card>

                                <div className="flex gap-4">
                                    <Card className="flex-1">
                                        <CardContent className="flex items-center gap-3 py-4">
                                            <Syringe className="h-5 w-5 text-muted-foreground shrink-0" />
                                            <div>
                                                <div className="text-2xl font-bold">{stats.vacDueSoon}</div>
                                                <p className="text-xs text-muted-foreground">Due in 14d</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="flex-1">
                                        <CardContent className="flex items-center gap-3 py-4">
                                            <Repeat className="h-5 w-5 text-muted-foreground shrink-0" />
                                            <div>
                                                <div className="text-2xl font-bold">{stats.repeatClientRate}%</div>
                                                <p className="text-xs text-muted-foreground">Repeat clients</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {expiringInventory.length > 0 && (
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="flex items-center gap-2 text-sm">
                                                    <Package className="h-4 w-4 text-amber-500" />
                                                    Expiring Soon (30 days)
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                {expiringInventory.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium truncate">{item.name}</p>
                                                            <p className="text-xs text-muted-foreground">SKU: {item.sku} · Qty: {item.quantity_on_hand}</p>
                                                        </div>
                                                        <div className="text-right shrink-0 ml-2">
                                                            <p className="text-xs font-medium text-amber-600">{formatDate(item.expiry_date)}</p>
                                                            <p className="text-xs text-muted-foreground">{formatCurrency(item.selling_price * item.quantity_on_hand)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
