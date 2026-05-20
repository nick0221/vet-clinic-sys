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
import labRequests from '@/routes/lab-requests';
import { formatDate } from '@/lib/utils';

interface Pet { id: number; name: string }
interface Veterinarian { id: number; name: string }
interface LabTest { id: number; name: string }

interface LabRequestData {
    id: number;
    pet: Pet;
    lab_test: LabTest;
    veterinarian: Veterinarian;
    request_date: string;
    status: string;
    notes: string | null;
}

interface PaginatedData {
    data: LabRequestData[];
    current_page: number; last_page: number; per_page: number; total: number; from: number; to: number;
}

interface Props {
    labRequests: PaginatedData;
    pets: Pet[];
    veterinarians: Veterinarian[];
    labTests: LabTest[];
    filters: { search?: string; status?: string };
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100',
    collected: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100',
    in_progress: 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-100',
    completed: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-100',
    cancelled: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-100',
};

export default function LabRequestsIndex({ labRequests: data, pets, veterinarians, labTests, filters }: Props) {
    const [open, setOpen] = useState(false);
    const { data: formData, setData, post, processing, errors, reset } = useForm({
        pet_id: '',
        veterinarian_id: '',
        lab_test_id: '',
        request_date: '',
        status: 'pending',
        notes: '',
    });

    const [editingLabRequest, setEditingLabRequest] = useState<LabRequestData | null>(null);
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
            router.get(labRequests.index.url(), { search, status: statusFilter || undefined }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [search, statusFilter]);

    function clearFilters() {
        setSearch('');
        setStatusFilter('');
        router.get(labRequests.index.url());
    }

    const hasFilters = search || statusFilter;

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(labRequests.store.url(), {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    }

    function handleEditSubmit(e: FormEvent) {
        e.preventDefault();
        if (!editingLabRequest) return;
        const values = formToJson(e.currentTarget as HTMLFormElement);
        router.put(labRequests.update.url(editingLabRequest.id), values, {
            onSuccess: () => setEditingLabRequest(null),
            onError: () => {},
        });
    }

    return (
        <>
            <Head title="Lab Requests" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold tracking-tight">Lab Requests</h1>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus /> New Lab Request</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>New Lab Request</DialogTitle>
                                <DialogDescription>Create a new lab request.</DialogDescription>
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="lab_test_id">Lab Test</Label>
                                            <select id="lab_test_id" value={formData.lab_test_id} onChange={(e) => setData('lab_test_id', e.target.value)} required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                <option value="">Select test...</option>
                                                {labTests.map(t => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
                                            </select>
                                            {errors.lab_test_id && <p className="text-sm text-destructive">{errors.lab_test_id}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="request_date">Request Date</Label>
                                            <Input id="request_date" type="date" value={formData.request_date} onChange={(e) => setData('request_date', e.target.value)} required />
                                            {errors.request_date && <p className="text-sm text-destructive">{errors.request_date}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="status">Status</Label>
                                        <select id="status" value={formData.status} onChange={(e) => setData('status', e.target.value)} required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                            <option value="pending">Pending</option>
                                            <option value="collected">Collected</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                        {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
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
                            placeholder="Search by notes..."
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
                        <option value="pending">Pending</option>
                        <option value="collected">Collected</option>
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

                {/* Edit Lab Request Dialog */}
                <Dialog open={editingLabRequest !== null} onOpenChange={(open) => { if (!open) setEditingLabRequest(null); }}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Edit Lab Request</DialogTitle>
                            <DialogDescription>Update lab request.</DialogDescription>
                        </DialogHeader>
                        {editingLabRequest && (
                            <form onSubmit={handleEditSubmit} key={editingLabRequest.id}>
                                <div className="max-h-[65vh] overflow-y-auto space-y-4 px-px">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-pet_id">Pet</Label>
                                            <select id="edit-pet_id" name="pet_id" required defaultValue={editingLabRequest.pet.id} className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                <option value="">Select pet...</option>
                                                {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                            {pageErrors.pet_id && <p className="text-sm text-destructive">{pageErrors.pet_id}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-veterinarian_id">Veterinarian</Label>
                                            <select id="edit-veterinarian_id" name="veterinarian_id" required defaultValue={editingLabRequest.veterinarian.id} className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                <option value="">Select vet...</option>
                                                {veterinarians.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                            </select>
                                            {pageErrors.veterinarian_id && <p className="text-sm text-destructive">{pageErrors.veterinarian_id}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-lab_test_id">Lab Test</Label>
                                            <select id="edit-lab_test_id" name="lab_test_id" required defaultValue={editingLabRequest.lab_test.id} className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                <option value="">Select test...</option>
                                                {labTests.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                            {pageErrors.lab_test_id && <p className="text-sm text-destructive">{pageErrors.lab_test_id}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-request_date">Request Date</Label>
                                            <Input id="edit-request_date" name="request_date" type="date" defaultValue={editingLabRequest.request_date} required />
                                            {pageErrors.request_date && <p className="text-sm text-destructive">{pageErrors.request_date}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-status">Status</Label>
                                        <select id="edit-status" name="status" required defaultValue={editingLabRequest.status} className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                            <option value="pending">Pending</option>
                                            <option value="collected">Collected</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                        {pageErrors.status && <p className="text-sm text-destructive">{pageErrors.status}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-notes">Notes</Label>
                                        <textarea id="edit-notes" name="notes" rows={3} defaultValue={editingLabRequest.notes ?? ''} className="border-input flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
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
                        <CardTitle>All Lab Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No lab requests found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium">ID</th>
                                            <th className="pb-3 font-medium">Pet</th>
                                            <th className="pb-3 font-medium">Test</th>
                                            <th className="pb-3 font-medium">Veterinarian</th>
                                            <th className="pb-3 font-medium">Request Date</th>
                                            <th className="pb-3 font-medium">Status</th>
                                            <th className="pb-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.data.map((lr) => (
                                            <tr key={lr.id} className="border-b last:border-0">
                                                <td className="py-3">{lr.id}</td>
                                                <td className="py-3">
                                                    <Link href={labRequests.show(lr.id)} className="font-medium hover:underline">
                                                        {lr.pet.name}
                                                    </Link>
                                                </td>
                                                <td className="py-3">{lr.lab_test.name}</td>
                                                <td className="py-3 text-muted-foreground">{lr.veterinarian.name}</td>
                                                <td className="py-3">{formatDate(lr.request_date)}</td>
                                                <td className="py-3">
                                                    <Badge variant="outline" className={statusColors[lr.status] ?? ''}>
                                                        {lr.status.replace('_', ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={labRequests.show(lr.id)}>
                                                            <Button variant="ghost" size="sm">View</Button>
                                                        </Link>
                                                        <Button variant="ghost" size="sm" onClick={() => setEditingLabRequest(lr)}>
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
                                    {data.current_page > 1 && <Button variant="outline" size="sm" onClick={() => router.get(labRequests.index.url({ query: { page: data.current_page - 1, search: search || undefined, status: statusFilter || undefined } }), {}, { preserveState: true })}>Previous</Button>}
                                    {data.current_page < data.last_page && <Button variant="outline" size="sm" onClick={() => router.get(labRequests.index.url({ query: { page: data.current_page + 1, search: search || undefined, status: statusFilter || undefined } }), {}, { preserveState: true })}>Next</Button>}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

LabRequestsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Lab Requests', href: labRequests.index() },
    ],
};
