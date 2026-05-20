import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

import { CalendarDays, ChevronLeft, ChevronRight, Clock, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import appointments from '@/routes/appointments';
import { formatDateTime } from '@/lib/utils';

interface Pet { id: number; name: string; client_id: number }
interface Client { id: number; name: string }
interface Veterinarian { id: number; name: string }

interface AppointmentData {
    id: number;
    pet: Pet;
    client: Client;
    veterinarian: Veterinarian;
    date_time: string;
    status: string;
    type: string;
    reason: string;
    duration: number;
}

interface PaginatedData {
    data: AppointmentData[];
    current_page: number; last_page: number; per_page: number; total: number; from: number; to: number;
}

interface Props {
    appointments: PaginatedData;
    veterinarians: Veterinarian[];
    pets: Pet[];
    clients: Client[];
    filters: { status?: string; date_from?: string; date_to?: string; search?: string };
    calendarCounts: Record<string, number>;
    calendarMonth: number;
    calendarYear: number;
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    scheduled: 'outline',
    confirmed: 'default',
    in_progress: 'default',
    completed: 'secondary',
    cancelled: 'destructive',
    no_show: 'destructive',
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function navigate(opts: Record<string, string | number | undefined | null>) {
    const hasPage = 'page' in opts;
    router.get(appointments.index.url({ query: hasPage ? opts : { ...opts, page: null } }), {}, { preserveState: true, preserveScroll: true });
}

export default function AppointmentsIndex({ appointments: data, veterinarians, pets: allPets, clients: allClients, filters, calendarCounts, calendarMonth, calendarYear }: Props) {
    const [searchValue, setSearchValue] = React.useState(filters?.search ?? '');
    const [createOpen, setCreateOpen] = React.useState(false);
    const [editingAppointment, setEditingAppointment] = React.useState<AppointmentData | null>(null);
    const { errors } = usePage().props;

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const firstDay = new Date(calendarYear, calendarMonth - 1, 1);
    const lastDay = new Date(calendarYear, calendarMonth, 0);
    const daysInMonth = lastDay.getDate();
    const startDow = firstDay.getDay();

    const activeDate = filters?.date_from === filters?.date_to ? filters?.date_from : null;

    function formToJson(form: HTMLFormElement) {
        const data = new FormData(form);
        const values: Record<string, unknown> = {};
        for (const [key, value] of data) {
            values[key] = value === '' ? null : value;
        }
        return values;
    }

    function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const values = formToJson(e.currentTarget);
        router.post(appointments.store.url(), values, {
            onSuccess: () => setCreateOpen(false),
            onError: () => {},
        });
    }

    function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingAppointment) return;
        const values = formToJson(e.currentTarget);
        router.put(appointments.update.url(editingAppointment.id), values, {
            onSuccess: () => setEditingAppointment(null),
            onError: () => {},
        });
    }

    function handleSearch() {
        navigate({ search: searchValue || null, status: filters?.status, date_from: filters?.date_from, date_to: filters?.date_to, cal_month: calendarMonth, cal_year: calendarYear });
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') handleSearch();
    }

    function clearFilters() {
        setSearchValue('');
        navigate({ search: null, status: null, date_from: null, date_to: null, cal_month: calendarMonth, cal_year: calendarYear });
    }

    function goMonth(delta: number) {
        let m = calendarMonth + delta;
        let y = calendarYear;
        if (m < 1) { m = 12; y--; }
        if (m > 12) { m = 1; y++; }
        navigate({ cal_month: m, cal_year: y, status: filters?.status, search: filters?.search, date_from: filters?.date_from, date_to: filters?.date_to });
    }

    function goToday() {
        const now = new Date();
        const m = now.getMonth() + 1;
        const y = now.getFullYear();
        const todayStr = now.toISOString().slice(0, 10);
        navigate({ cal_month: m, cal_year: y, date_from: todayStr, date_to: todayStr, status: filters?.status, search: filters?.search });
    }

    function pickDate(dateStr: string) {
        if (activeDate === dateStr) {
            navigate({ date_from: null, date_to: null, status: filters?.status, search: filters?.search, cal_month: calendarMonth, cal_year: calendarYear });
        } else {
            navigate({ date_from: dateStr, date_to: dateStr, status: filters?.status, search: filters?.search, cal_month: calendarMonth, cal_year: calendarYear });
        }
    }

    const weekRows: React.ReactNode[] = [];
    let dayCells: React.ReactNode[] = [];
    for (let i = 0; i < startDow; i++) {
        dayCells.push(<td key={`pad-${i}`} className="p-1" />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const count = calendarCounts[dateStr] ?? 0;
        const isToday = dateStr === todayStr;
        const isActive = activeDate === dateStr;

        dayCells.push(
            <td key={dateStr} className="p-0.5">
                <button
                    onClick={() => pickDate(dateStr)}
                    className={`flex h-14 w-full flex-col items-center justify-center rounded-md text-xs transition-colors
                        ${isActive ? 'bg-primary text-primary-foreground' : isToday ? 'ring-1 ring-inset ring-primary' : 'hover:bg-accent'}
                        ${!count && !isActive ? 'text-muted-foreground' : ''}`}
                >
                    <span className={`text-sm leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>{d}</span>
                    {count > 0 && (
                        <span className={`mt-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold
                            ${isActive ? 'bg-primary-foreground text-primary' : 'bg-primary/10 text-primary'}`}
                        >
                            {count}
                        </span>
                    )}
                </button>
            </td>
        );
        if ((startDow + d) % 7 === 0 || d === daysInMonth) {
            while (dayCells.length % 7 !== 0) {
                dayCells.push(<td key={`pad-end-${d}-${dayCells.length}`} className="p-1" />);
            }
            weekRows.push(<tr key={`week-${d}`} className="[&_td]:p-0.5">{dayCells}</tr>);
            dayCells = [];
        }
    }

    const hasFilters = filters?.search || filters?.status || filters?.date_from;

    return (
        <>
            <Head title="Appointments" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold tracking-tight">Appointments</h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Search appointments..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="h-9 w-64"
                            />
                            <Button variant="outline" size="sm" onClick={handleSearch}>
                                <Search />
                            </Button>
                            {hasFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters}>
                                    <X />
                                </Button>
                            )}
                        </div>
                        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                            <DialogTrigger asChild>
                                <Button><Plus /> Book Appointment</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>Book Appointment</DialogTitle>
                                    <DialogDescription>Schedule a new appointment.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateSubmit}>
                                    <div className="max-h-[65vh] overflow-y-auto space-y-4 px-px">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="pet_id">Pet</Label>
                                                <select id="pet_id" name="pet_id" required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                    <option value="">Select pet...</option>
                                                    {allPets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                                {errors.pet_id && <p className="text-sm text-destructive">{errors.pet_id}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="client_id">Owner</Label>
                                                <select id="client_id" name="client_id" required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                    <option value="">Select owner...</option>
                                                    {allClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                                {errors.client_id && <p className="text-sm text-destructive">{errors.client_id}</p>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="veterinarian_id">Veterinarian</Label>
                                                <select id="veterinarian_id" name="veterinarian_id" required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                    <option value="">Select vet...</option>
                                                    {veterinarians.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                                </select>
                                                {errors.veterinarian_id && <p className="text-sm text-destructive">{errors.veterinarian_id}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="type">Type</Label>
                                                <select id="type" name="type" required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                    <option value="checkup">Checkup</option>
                                                    <option value="vaccination">Vaccination</option>
                                                    <option value="surgery">Surgery</option>
                                                    <option value="follow_up">Follow Up</option>
                                                    <option value="emergency">Emergency</option>
                                                    <option value="dental">Dental</option>
                                                    <option value="grooming">Grooming</option>
                                                    <option value="other">Other</option>
                                                </select>
                                                {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="date_time">Date & Time</Label>
                                                <Input id="date_time" name="date_time" type="datetime-local" required />
                                                {errors.date_time && <p className="text-sm text-destructive">{errors.date_time}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="duration">Duration (min)</Label>
                                                <Input id="duration" name="duration" type="number" defaultValue={30} required />
                                                {errors.duration && <p className="text-sm text-destructive">{errors.duration}</p>}
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="reason">Reason</Label>
                                            <textarea id="reason" name="reason" required className="border-input flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                            {errors.reason && <p className="text-sm text-destructive">{errors.reason}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="notes">Notes</Label>
                                            <textarea id="notes" name="notes" className="border-input flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                            {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                                        </div>
                                        <input type="hidden" name="status" value="scheduled" />
                                    </div>
                                    <DialogFooter className="mt-4">
                                        <Button type="submit">Save</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">{MONTHS[calendarMonth - 1]} {calendarYear}</CardTitle>
                                <div className="flex gap-1">
                                    <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={goToday}>Today</Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => goMonth(-1)}><ChevronLeft /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => goMonth(1)}><ChevronRight /></Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <table className="w-full table-fixed">
                                <thead>
                                    <tr>
                                        {DAYS.map(d => <th key={d} className="pb-1 text-center text-xs font-medium text-muted-foreground">{d}</th>)}
                                    </tr>
                                </thead>
                                <tbody>{weekRows}</tbody>
                            </table>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                value={filters?.status ?? ''}
                                onChange={(e) => navigate({ status: e.target.value || null, search: filters?.search, date_from: filters?.date_from, date_to: filters?.date_to, cal_month: calendarMonth, cal_year: calendarYear })}
                                className="border-input flex h-9 w-40 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                            >
                                <option value="">All statuses</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="no_show">No Show</option>
                            </select>

                            <div className="flex gap-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                                    {data.total} total
                                </span>
                                {activeDate && (
                                    <span className="flex items-center gap-1">
                                        <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                                        {activeDate}
                                    </span>
                                )}
                            </div>
                        </div>

                        {activeDate && data.data.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                        <CardTitle className="text-base">Day Agenda — {activeDate}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-0">
                                        {data.data.map((apt, i) => {
                                            const time = apt.date_time.includes('T') ? apt.date_time.split('T')[1].slice(0, 5) : '';
                                            return (
                                                <div key={apt.id} className="relative flex gap-4 pb-4 pl-8 last:pb-0">
                                                    {i < data.data.length - 1 && (
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
                                                            <p className="text-sm font-medium truncate">{apt.pet.name}</p>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {time && <span className="text-xs text-muted-foreground">{time}</span>}
                                                                <Badge variant={statusColors[apt.status] ?? 'outline'} className="text-[10px] px-1.5 py-0">{apt.status.replace('_', ' ')}</Badge>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground truncate">{apt.reason}</p>
                                                        <p className="text-xs text-muted-foreground">{apt.client.name} · {apt.veterinarian.name}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>All Appointments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {data.data.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No appointments found.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b text-left">
                                                    <th className="pb-3 font-medium">Pet</th>
                                                    <th className="pb-3 font-medium">Owner</th>
                                                    <th className="pb-3 font-medium">Vet</th>
                                                    <th className="pb-3 font-medium">Date & Time</th>
                                                    <th className="pb-3 font-medium">Type</th>
                                                    <th className="pb-3 font-medium">Status</th>
                                                    <th className="pb-3 font-medium text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.data.map((apt) => (
                                                    <tr key={apt.id} className="border-b last:border-0">
                                                        <td className="py-3">
                                                            <Link href={appointments.show(apt.id)} className="font-medium hover:underline">
                                                                {apt.pet.name}
                                                            </Link>
                                                        </td>
                                                        <td className="py-3">{apt.client.name}</td>
                                                        <td className="py-3 text-muted-foreground">{apt.veterinarian.name}</td>
                                                        <td className="py-3">{formatDateTime(apt.date_time)}</td>
                                                        <td className="py-3 capitalize">{apt.type.replace('_', ' ')}</td>
                                                        <td className="py-3">
                                                            <Badge variant={statusColors[apt.status] ?? 'outline'}>
                                                                {apt.status.replace('_', ' ')}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button variant="ghost" size="sm" onClick={() => setEditingAppointment(apt)}>
                                                                    <Pencil />
                                                                </Button>
                                                                <Button variant="ghost" size="sm" onClick={() => { if (confirm('Cancel this appointment?')) router.delete(appointments.destroy.url(apt.id)); }}>
                                                                    <Trash2 className="text-destructive" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                {data.last_page > 1 && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">Showing {data.from} to {data.to} of {data.total}</p>
                                        <div className="flex gap-2">
                                            {data.current_page > 1 && <Button variant="outline" size="sm" onClick={() => navigate({ page: data.current_page - 1, search: searchValue || undefined, status: filters?.status, date_from: filters?.date_from, date_to: filters?.date_to, cal_month: calendarMonth, cal_year: calendarYear })}>Previous</Button>}
                                            {data.current_page < data.last_page && <Button variant="outline" size="sm" onClick={() => navigate({ page: data.current_page + 1, search: searchValue || undefined, status: filters?.status, date_from: filters?.date_from, date_to: filters?.date_to, cal_month: calendarMonth, cal_year: calendarYear })}>Next</Button>}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Edit Appointment Dialog */}
                <Dialog open={editingAppointment !== null} onOpenChange={(open) => { if (!open) setEditingAppointment(null); }}>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Edit Appointment</DialogTitle>
                            <DialogDescription>Update appointment details.</DialogDescription>
                        </DialogHeader>
                        {editingAppointment && (
                            <form onSubmit={handleEditSubmit} key={editingAppointment.id}>
                                <div className="max-h-[65vh] overflow-y-auto space-y-4 px-px">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-pet_id">Pet</Label>
                                            <select id="edit-pet_id" name="pet_id" required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" defaultValue={editingAppointment.pet.id}>
                                                <option value="">Select pet...</option>
                                                {allPets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                            {errors.pet_id && <p className="text-sm text-destructive">{errors.pet_id}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-client_id">Owner</Label>
                                            <select id="edit-client_id" name="client_id" required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" defaultValue={editingAppointment.client.id}>
                                                <option value="">Select owner...</option>
                                                {allClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                            {errors.client_id && <p className="text-sm text-destructive">{errors.client_id}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-veterinarian_id">Veterinarian</Label>
                                            <select id="edit-veterinarian_id" name="veterinarian_id" required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" defaultValue={editingAppointment.veterinarian.id}>
                                                <option value="">Select vet...</option>
                                                {veterinarians.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                            </select>
                                            {errors.veterinarian_id && <p className="text-sm text-destructive">{errors.veterinarian_id}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-type">Type</Label>
                                            <select id="edit-type" name="type" required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" defaultValue={editingAppointment.type}>
                                                <option value="checkup">Checkup</option>
                                                <option value="vaccination">Vaccination</option>
                                                <option value="surgery">Surgery</option>
                                                <option value="follow_up">Follow Up</option>
                                                <option value="emergency">Emergency</option>
                                                <option value="dental">Dental</option>
                                                <option value="grooming">Grooming</option>
                                                <option value="other">Other</option>
                                            </select>
                                            {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-date_time">Date & Time</Label>
                                            <Input id="edit-date_time" name="date_time" type="datetime-local" defaultValue={editingAppointment.date_time} required />
                                            {errors.date_time && <p className="text-sm text-destructive">{errors.date_time}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-duration">Duration (min)</Label>
                                            <Input id="edit-duration" name="duration" type="number" defaultValue={editingAppointment.duration} required />
                                            {errors.duration && <p className="text-sm text-destructive">{errors.duration}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-reason">Reason</Label>
                                        <textarea id="edit-reason" name="reason" required className="border-input flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" defaultValue={editingAppointment.reason} />
                                        {errors.reason && <p className="text-sm text-destructive">{errors.reason}</p>}
                                    </div>
                                </div>
                                <DialogFooter className="mt-4">
                                    <Button type="submit">Save</Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

AppointmentsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Appointments', href: appointments.index() },
    ],
};
