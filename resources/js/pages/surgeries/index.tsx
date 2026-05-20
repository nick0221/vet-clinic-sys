import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState, type FormEvent } from 'react';
import { LoaderCircle, Pencil, Plus, Search, X } from 'lucide-react';
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
import surgeries from '@/routes/surgeries';
import { formatDate } from '@/lib/utils';

interface Pet { id: number; name: string }
interface Veterinarian { id: number; name: string }

interface SurgeryData {
    id: number;
    surgery_name: string;
    description: string | null;
    pet: Pet;
    veterinarian: Veterinarian;
    scheduled_date: string;
    start_time: string | null;
    end_time: string | null;
    status: string;
    notes: string | null;
}

interface PaginatedData {
    data: SurgeryData[];
    current_page: number; last_page: number; per_page: number; total: number; from: number; to: number;
}

interface Props {
    surgeries: PaginatedData;
    pets: Pet[];
    veterinarians: Veterinarian[];
    filters: { search?: string; status?: string };
}

const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100',
    in_progress: 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-100',
    completed: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-100',
    cancelled: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-100',
};

export default function SurgeriesIndex({ surgeries: data, pets, veterinarians, filters }: Props) {
    const [open, setOpen] = useState(false);
    const { data: formData, setData, post, processing, errors, reset } = useForm({
        pet_id: '',
        veterinarian_id: '',
        surgery_name: '',
        description: '',
        scheduled_date: '',
        start_time: '',
        end_time: '',
        status: 'scheduled',
        notes: '',
    });

    const [editingSurgery, setEditingSurgery] = useState<SurgeryData | null>(null);
    const { errors: pageErrors } = usePage().props;

    function formToJson(form: HTMLFormElement) {
        const data = new FormData(form);
        const values: Record<string, unknown> = {};
        for (const [key, value] of data) {
            values[key] = value === '' ? null : value;
        }
        return values;
    }

    const [search, setSearch] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(surgeries.index.url(), { search, status: statusFilter || undefined }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [search, statusFilter]);

    function clearFilters() {
        setSearch('');
        setStatusFilter('');
        router.get(surgeries.index.url());
    }

    const hasFilters = search || statusFilter;

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(surgeries.store.url(), {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    }

    function handleEditSubmit(e: FormEvent) {
        e.preventDefault();
        if (!editingSurgery) return;
        const values = formToJson(e.currentTarget as HTMLFormElement);
        router.put(surgeries.update.url(editingSurgery.id), values, {
            onSuccess: () => setEditingSurgery(null),
            onError: () => {},
        });
    }

    return (
        <>
            <Head title="Surgeries" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold tracking-tight">Surgeries</h1>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus /> Schedule Surgery</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Schedule Surgery</DialogTitle>
                                <DialogDescription>Schedule a new surgery.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit}>
                                <div className="max-h-[65vh] overflow-y-auto space-y-4 px-px">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="pet_id">Pet</Label>
                                            <select id="pet_id" value={formData.pet_id} onChange={(e) => setData('pet_id', e.target.value)} required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                <option value="">Select pet...</option>
                                                {pets.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
                                            </select>
                                            {errors.pet_id && <p className="text-sm text-destructive">{errors.pet_id}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="veterinarian_id">Veterinarian</Label>
                                            <select id="veterinarian_id" value={formData.veterinarian_id} onChange={(e) => setData('veterinarian_id', e.target.value)} required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                <option value="">Select vet...</option>
                                                {veterinarians.map(v => <option key={v.id} value={String(v.id)}>{v.name}</option>)}
                                            </select>
                                            {errors.veterinarian_id && <p className="text-sm text-destructive">{errors.veterinarian_id}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="surgery_name">Surgery Name</Label>
                                        <Input id="surgery_name" value={formData.surgery_name} onChange={(e) => setData('surgery_name', e.target.value)} required />
                                        {errors.surgery_name && <p className="text-sm text-destructive">{errors.surgery_name}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <textarea id="description" value={formData.description} onChange={(e) => setData('description', e.target.value)} className="border-input flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="scheduled_date">Scheduled Date</Label>
                                            <Input id="scheduled_date" type="date" value={formData.scheduled_date} onChange={(e) => setData('scheduled_date', e.target.value)} required />
                                            {errors.scheduled_date && <p className="text-sm text-destructive">{errors.scheduled_date}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="status">Status</Label>
                                            <select id="status" value={formData.status} onChange={(e) => setData('status', e.target.value)} required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                <option value="scheduled">Scheduled</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                            {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="start_time">Start Time</Label>
                                            <Input id="start_time" type="time" value={formData.start_time} onChange={(e) => setData('start_time', e.target.value)} />
                                            {errors.start_time && <p className="text-sm text-destructive">{errors.start_time}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="end_time">End Time</Label>
                                            <Input id="end_time" type="time" value={formData.end_time} onChange={(e) => setData('end_time', e.target.value)} />
                                            {errors.end_time && <p className="text-sm text-destructive">{errors.end_time}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <textarea id="notes" value={formData.notes} onChange={(e) => setData('notes', e.target.value)} className="border-input flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                    </div>
                                </div>
                                <DialogFooter className="mt-4">
                                    <Button type="submit" disabled={processing}>
                                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        Save
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by surgery name, description or notes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border-input flex h-9 w-40 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                    >
                        <option value="">All statuses</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            <X className="h-4 w-4 mr-1" /> Clear
                        </Button>
                    )}
                </div>

                {/* Edit Surgery Dialog */}
                <Dialog open={editingSurgery !== null} onOpenChange={(open) => { if (!open) setEditingSurgery(null); }}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Edit Surgery</DialogTitle>
                            <DialogDescription>Update surgery.</DialogDescription>
                        </DialogHeader>
                        {editingSurgery && (
                            <form onSubmit={handleEditSubmit} key={editingSurgery.id}>
                                <div className="max-h-[65vh] overflow-y-auto space-y-4 px-px">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-pet_id">Pet</Label>
                                            <select id="edit-pet_id" name="pet_id" required defaultValue={editingSurgery.pet.id} className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                <option value="">Select pet...</option>
                                                {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
{pageErrors.pet_id && <p className="text-sm text-destructive">{pageErrors.pet_id}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-veterinarian_id">Veterinarian</Label>
                                            <select id="edit-veterinarian_id" name="veterinarian_id" required defaultValue={editingSurgery.veterinarian.id} className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                <option value="">Select vet...</option>
                                                {veterinarians.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                            </select>
                                            {pageErrors.veterinarian_id && <p className="text-sm text-destructive">{pageErrors.veterinarian_id}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-surgery_name">Surgery Name</Label>
                                        <Input id="edit-surgery_name" name="surgery_name" defaultValue={editingSurgery.surgery_name} required />
                                        {pageErrors.surgery_name && <p className="text-sm text-destructive">{pageErrors.surgery_name}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-description">Description</Label>
                                        <textarea id="edit-description" name="description" defaultValue={editingSurgery.description ?? ''} className="border-input flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                        {pageErrors.description && <p className="text-sm text-destructive">{pageErrors.description}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-scheduled_date">Scheduled Date</Label>
                                            <Input id="edit-scheduled_date" name="scheduled_date" type="date" defaultValue={editingSurgery.scheduled_date} required />
                                        {pageErrors.scheduled_date && <p className="text-sm text-destructive">{pageErrors.scheduled_date}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-status">Status</Label>
                                            <select id="edit-status" name="status" required defaultValue={editingSurgery.status} className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                <option value="scheduled">Scheduled</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                            {pageErrors.status && <p className="text-sm text-destructive">{pageErrors.status}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-start_time">Start Time</Label>
                                            <Input id="edit-start_time" name="start_time" type="time" defaultValue={editingSurgery.start_time ?? ''} />
                                            {pageErrors.start_time && <p className="text-sm text-destructive">{pageErrors.start_time}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-end_time">End Time</Label>
                                            <Input id="edit-end_time" name="end_time" type="time" defaultValue={editingSurgery.end_time ?? ''} />
                                            {pageErrors.end_time && <p className="text-sm text-destructive">{pageErrors.end_time}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-notes">Notes</Label>
                                        <textarea id="edit-notes" name="notes" rows={3} defaultValue={editingSurgery.notes ?? ''} className="border-input flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                        {pageErrors.notes && <p className="text-sm text-destructive">{pageErrors.notes}</p>}
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
                        <CardTitle>All Surgeries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No surgeries found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium">Surgery Name</th>
                                            <th className="pb-3 font-medium">Pet</th>
                                            <th className="pb-3 font-medium">Veterinarian</th>
                                            <th className="pb-3 font-medium">Scheduled Date</th>
                                            <th className="pb-3 font-medium">Status</th>
                                            <th className="pb-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.data.map((s) => (
                                            <tr key={s.id} className="border-b last:border-0">
                                                <td className="py-3 font-medium">
                                                    <Link href={surgeries.show(s.id)} className="hover:underline">
                                                        {s.surgery_name}
                                                    </Link>
                                                </td>
                                                <td className="py-3">{s.pet.name}</td>
                                                <td className="py-3 text-muted-foreground">{s.veterinarian.name}</td>
                                                <td className="py-3">{formatDate(s.scheduled_date)}</td>
                                                <td className="py-3">
                                                    <Badge variant="outline" className={statusColors[s.status] ?? ''}>
                                                        {s.status.replace('_', ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={surgeries.show(s.id)}>
                                                            <Button variant="ghost" size="sm">View</Button>
                                                        </Link>
                                                        <Button variant="ghost" size="sm" onClick={() => setEditingSurgery(s)}>
                                                            <Pencil />
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
                                    {data.current_page > 1 && <Button variant="outline" size="sm" onClick={() => router.get(surgeries.index.url({ query: { page: data.current_page - 1, search: search || undefined, status: statusFilter || undefined } }), {}, { preserveState: true })}>Previous</Button>}
                                    {data.current_page < data.last_page && <Button variant="outline" size="sm" onClick={() => router.get(surgeries.index.url({ query: { page: data.current_page + 1, search: search || undefined, status: statusFilter || undefined } }), {}, { preserveState: true })}>Next</Button>}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

SurgeriesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Surgeries', href: surgeries.index() },
    ],
};
