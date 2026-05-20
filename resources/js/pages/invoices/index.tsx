import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
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
import invoices from '@/routes/invoices';
import { formatDate } from '@/lib/utils';

interface Client { id: number; name: string }
interface Pet { id: number; name: string }
interface Veterinarian { id: number; name: string }

interface InvoiceData {
    id: number;
    invoice_number: string;
    subtotal: string;
    tax: string;
    total: string;
    status: string;
    due_date: string | null;
    notes: string | null;
    client: Client;
    pet: Pet;
    veterinarian: Veterinarian;
    created_at: string;
}

interface PaginatedData {
    data: InvoiceData[];
    current_page: number; last_page: number; per_page: number; total: number; from: number; to: number;
}

interface Props {
    invoices: PaginatedData;
    clients: Client[];
    pets: Pet[];
    veterinarians: Veterinarian[];
    filters: { search?: string; status?: string };
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    draft: 'outline',
    pending: 'default',
    paid: 'secondary',
    overdue: 'destructive',
    cancelled: 'outline',
    refunded: 'default',
};

export default function InvoicesIndex({ invoices: data, clients, pets: allPets, veterinarians, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');
    const [createOpen, setCreateOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<InvoiceData | null>(null);
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
        router.post(invoices.store.url(), values, {
            onSuccess: () => setCreateOpen(false),
            onError: () => {},
        });
    }

    function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingInvoice) return;
        const values = formToJson(e.currentTarget);
        router.put(invoices.update.url(editingInvoice.id), values, {
            onSuccess: () => setEditingInvoice(null),
            onError: () => {},
        });
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(invoices.index.url(), { search, status: statusFilter || undefined }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [search, statusFilter]);

    function clearFilters() {
        setSearch('');
        setStatusFilter('');
        router.get(invoices.index.url());
    }

    const hasFilters = search || statusFilter;

    return (
        <>
            <Head title="Invoices" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold tracking-tight">Invoices</h1>
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus /> Create Invoice</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Create Invoice</DialogTitle>
                                <DialogDescription>Create a new invoice for a client.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateSubmit}>
                                <div className="max-h-[65vh] overflow-y-auto space-y-4 px-px">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="client_id">Client</Label>
                                            <select id="client_id" name="client_id" required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                <option value="">Select client...</option>
                                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                            {errors.client_id && <p className="text-sm text-destructive">{errors.client_id}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="pet_id">Pet</Label>
                                            <select id="pet_id" name="pet_id" required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                <option value="">Select pet...</option>
                                                {allPets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                            {errors.pet_id && <p className="text-sm text-destructive">{errors.pet_id}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="veterinarian_id">Veterinarian</Label>
                                        <select id="veterinarian_id" name="veterinarian_id" required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                            <option value="">Select vet...</option>
                                            {veterinarians.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                        </select>
                                        {errors.veterinarian_id && <p className="text-sm text-destructive">{errors.veterinarian_id}</p>}
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="subtotal">Subtotal</Label>
                                            <Input id="subtotal" name="subtotal" type="number" step="0.01" min="0" required />
                                            {errors.subtotal && <p className="text-sm text-destructive">{errors.subtotal}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="tax">Tax</Label>
                                            <Input id="tax" name="tax" type="number" step="0.01" min="0" required />
                                            {errors.tax && <p className="text-sm text-destructive">{errors.tax}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="total">Total</Label>
                                            <Input id="total" name="total" type="number" step="0.01" min="0" required />
                                            {errors.total && <p className="text-sm text-destructive">{errors.total}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="status">Status</Label>
                                            <select id="status" name="status" required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                <option value="draft">Draft</option>
                                                <option value="pending">Pending</option>
                                                <option value="paid">Paid</option>
                                                <option value="overdue">Overdue</option>
                                                <option value="cancelled">Cancelled</option>
                                                <option value="refunded">Refunded</option>
                                            </select>
                                            {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="due_date">Due Date</Label>
                                            <Input id="due_date" name="due_date" type="date" />
                                            {errors.due_date && <p className="text-sm text-destructive">{errors.due_date}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <textarea id="notes" name="notes" rows={3} className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                        {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                                    </div>
                                </div>
                                <DialogFooter className="mt-4">
                                    <Button type="submit">Save</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by invoice # or notes..."
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
                        <option value="draft">Draft</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                    </select>
                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            <X className="h-4 w-4 mr-1" /> Clear
                        </Button>
                    )}
                </div>

                {/* Edit Invoice Dialog */}
                <Dialog open={editingInvoice !== null} onOpenChange={(open) => { if (!open) setEditingInvoice(null); }}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Edit Invoice</DialogTitle>
                            <DialogDescription>Update invoice information.</DialogDescription>
                        </DialogHeader>
                        {editingInvoice && (
                            <form onSubmit={handleEditSubmit} key={editingInvoice.id}>
                                <div className="max-h-[65vh] overflow-y-auto space-y-4 px-px">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-client_id">Client</Label>
                                            <select id="edit-client_id" name="client_id" required defaultValue={editingInvoice.client.id} className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                <option value="">Select client...</option>
                                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                            {errors.client_id && <p className="text-sm text-destructive">{errors.client_id}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-pet_id">Pet</Label>
                                            <select id="edit-pet_id" name="pet_id" required defaultValue={editingInvoice.pet.id} className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                <option value="">Select pet...</option>
                                                {allPets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                            {errors.pet_id && <p className="text-sm text-destructive">{errors.pet_id}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-veterinarian_id">Veterinarian</Label>
                                        <select id="edit-veterinarian_id" name="veterinarian_id" required defaultValue={editingInvoice.veterinarian.id} className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                            <option value="">Select vet...</option>
                                            {veterinarians.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                        </select>
                                        {errors.veterinarian_id && <p className="text-sm text-destructive">{errors.veterinarian_id}</p>}
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-subtotal">Subtotal</Label>
                                            <Input id="edit-subtotal" name="subtotal" type="number" step="0.01" min="0" defaultValue={editingInvoice.subtotal} required />
                                            {errors.subtotal && <p className="text-sm text-destructive">{errors.subtotal}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-tax">Tax</Label>
                                            <Input id="edit-tax" name="tax" type="number" step="0.01" min="0" defaultValue={editingInvoice.tax} required />
                                            {errors.tax && <p className="text-sm text-destructive">{errors.tax}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-total">Total</Label>
                                            <Input id="edit-total" name="total" type="number" step="0.01" min="0" defaultValue={editingInvoice.total} required />
                                            {errors.total && <p className="text-sm text-destructive">{errors.total}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-status">Status</Label>
                                            <select id="edit-status" name="status" required defaultValue={editingInvoice.status} className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                <option value="draft">Draft</option>
                                                <option value="pending">Pending</option>
                                                <option value="paid">Paid</option>
                                                <option value="overdue">Overdue</option>
                                                <option value="cancelled">Cancelled</option>
                                                <option value="refunded">Refunded</option>
                                            </select>
                                            {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-due_date">Due Date</Label>
                                            <Input id="edit-due_date" name="due_date" type="date" defaultValue={editingInvoice.due_date ?? ''} />
                                            {errors.due_date && <p className="text-sm text-destructive">{errors.due_date}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-notes">Notes</Label>
                                        <textarea id="edit-notes" name="notes" rows={3} defaultValue={editingInvoice.notes ?? ''} className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                        {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
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
                        <CardTitle>All Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No invoices found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium">Invoice #</th>
                                            <th className="pb-3 font-medium">Client</th>
                                            <th className="pb-3 font-medium">Pet</th>
                                            <th className="pb-3 font-medium">Total</th>
                                            <th className="pb-3 font-medium">Status</th>
                                            <th className="pb-3 font-medium">Due Date</th>
                                            <th className="pb-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.data.map((inv) => (
                                            <tr key={inv.id} className="border-b last:border-0">
                                                <td className="py-3">
                                                    <Link href={invoices.show(inv.id)} className="font-medium hover:underline">
                                                        {inv.invoice_number}
                                                    </Link>
                                                </td>
                                                <td className="py-3">{inv.client.name}</td>
                                                <td className="py-3 text-muted-foreground">{inv.pet.name}</td>
                                                <td className="py-3">
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(inv.total))}
                                                </td>
                                                <td className="py-3">
                                                    <Badge variant={statusColors[inv.status] ?? 'outline'}>
                                                        {inv.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3">{formatDate(inv.due_date)}</td>
                                                <td className="py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={invoices.show(inv.id)}>
                                                            <Button variant="ghost" size="sm">View</Button>
                                                        </Link>
                                                        <Button variant="ghost" size="sm" onClick={() => setEditingInvoice(inv)}>
                                                            <Pencil />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete this invoice?')) router.delete(invoices.destroy.url(inv.id)); }}>
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
                                    {data.current_page > 1 && <Button variant="outline" size="sm" onClick={() => router.get(invoices.index.url({ query: { page: data.current_page - 1, search: search || undefined, status: statusFilter || undefined } }), {}, { preserveState: true })}>Previous</Button>}
                                    {data.current_page < data.last_page && <Button variant="outline" size="sm" onClick={() => router.get(invoices.index.url({ query: { page: data.current_page + 1, search: search || undefined, status: statusFilter || undefined } }), {}, { preserveState: true })}>Next</Button>}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

InvoicesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Invoices', href: invoices.index() },
    ],
};
