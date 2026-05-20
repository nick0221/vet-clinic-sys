import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
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
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    scheduled: 'outline',
    confirmed: 'default',
    in_progress: 'default',
    completed: 'secondary',
    cancelled: 'destructive',
    no_show: 'destructive',
};

export default function AppointmentsIndex({ appointments: data, veterinarians, pets: allPets, clients: allClients, filters }: Props) {
    const [searchValue, setSearchValue] = React.useState(filters?.search ?? '');
    const [createOpen, setCreateOpen] = React.useState(false);
    const [editingAppointment, setEditingAppointment] = React.useState<AppointmentData | null>(null);
    const { errors } = usePage().props;

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
        router.get(appointments.index.url({ query: { search: searchValue || null, page: null } }));
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') handleSearch();
    }

    function clearSearch() {
        setSearchValue('');
        router.get(appointments.index.url({ query: { search: null, page: null } }));
    }

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
                            {filters?.search && (
                                <Button variant="ghost" size="sm" onClick={clearSearch}>
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
                                                <td className="py-3">{new Date(apt.date_time).toLocaleString()}</td>
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
                                    {data.current_page > 1 && <Button variant="outline" size="sm" onClick={() => router.get(appointments.index.url({ query: { page: data.current_page - 1 } }))}>Previous</Button>}
                                    {data.current_page < data.last_page && <Button variant="outline" size="sm" onClick={() => router.get(appointments.index.url({ query: { page: data.current_page + 1 } }))}>Next</Button>}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
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
