import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    Banknote,
    Calendar,
    Clock,
    Dna,
    Package,
    PawPrint,
    Plus,
    Syringe,
    Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import appointmentsRoute from '@/routes/appointments';
import clients from '@/routes/clients';
import invoices from '@/routes/invoices';
import pets from '@/routes/pets';
import inventory from '@/routes/inventory';
import labRequests from '@/routes/lab-requests';
import surgeries from '@/routes/surgeries';
import vaccinations from '@/routes/vaccinations';
import { formatDate, formatDateTime } from '@/lib/utils';

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
    };
    recentClients: Client[];
    recentPets: Pet[];
    upcomingAppointments: Appointment[];
    todaySchedule: Appointment[];
    weekCounts: Record<string, number>;
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

export default function Dashboard({ stats, recentClients, recentPets, upcomingAppointments, todaySchedule, weekCounts }: DashboardProps) {
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
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
                        <p className="text-sm text-muted-foreground">{formatDate(new Date().toISOString())}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={appointmentsRoute.index()}>
                            <Button variant="outline" size="sm"><Plus /> Book Appointment</Button>
                        </Link>
                        <Link href={clients.index()}>
                            <Button variant="outline" size="sm"><Plus /> Add Client</Button>
                        </Link>
                    </div>
                </div>

                {hasAlerts && (
                    <Card className="border-amber-200 bg-amber-50">
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
                                <p className="text-xs text-muted-foreground">{formatCurrency(stats.monthRevenue)} this month</p>
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
                    </div>
                </div>
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
