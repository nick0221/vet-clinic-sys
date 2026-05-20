import { Head, Link } from '@inertiajs/react';
import {
    Banknote,
    Calendar,
    Dna,
    Microscope,
    Package,
    PawPrint,
    Syringe,
    Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import appointmentsRoute from '@/routes/appointments';
import clients from '@/routes/clients';
import invoices from '@/routes/invoices';
import pets from '@/routes/pets';
import { formatDate } from '@/lib/utils';

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
    };
    recentClients: Client[];
    recentPets: Pet[];
    upcomingAppointments: Appointment[];
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

export default function Dashboard({ stats, recentClients, recentPets, upcomingAppointments }: DashboardProps) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalClients}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
                            <PawPrint className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalPets}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Upcoming Vaccinations</CardTitle>
                            <Syringe className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.upcomingVaccinations}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.lowStockItems}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Pending Lab Requests</CardTitle>
                            <Dna className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pendingLabRequests}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Today's Surgeries</CardTitle>
                            <Microscope className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.todaySurgeries}</div>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Appointments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {upcomingAppointments.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
                                )}
                                {upcomingAppointments.map((apt) => (
                                    <div key={apt.id} className="flex items-center justify-between">
                                        <div>
                                            <Link
                                                href={appointmentsRoute.show(apt.id)}
                                                className="text-sm font-medium hover:underline"
                                            >
                                                {apt.pet.name}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                {apt.client.name} — {formatDate(apt.date_time)}
                                            </p>
                                        </div>
                                        <Badge variant={statusColor(apt.status)}>
                                            {apt.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Clients</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentClients.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No clients yet.</p>
                                )}
                                {recentClients.map((client) => (
                                    <div key={client.id} className="flex items-center justify-between">
                                        <div>
                                            <Link
                                                href={clients.show(client.id)}
                                                className="text-sm font-medium hover:underline"
                                            >
                                                {client.name}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">{client.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Patients</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentPets.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No pets registered yet.</p>
                                )}
                                {recentPets.map((pet) => (
                                    <div key={pet.id} className="flex items-center justify-between">
                                        <div>
                                            <Link
                                                href={pets.show(pet.id)}
                                                className="text-sm font-medium hover:underline"
                                            >
                                                {pet.name}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                {pet.species} - {pet.client.name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
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
