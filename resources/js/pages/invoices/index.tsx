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

interface InvoiceItemData {
    id: number;
    description: string;
    quantity: string;
    unit_price: string;
    total: string;
    type: string;
}

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
    items: InvoiceItemData[];
    created_at: string;
}

interface LineItemState {
    key: string;
    description: string;
    quantity: number;
    unit_price: number;
    type: 'service' | 'product';
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

    const [items, setItems] = useState<LineItemState[]>([]);
    const [taxPercent, setTaxPercent] = useState(0);
    const [editItems, setEditItems] = useState<LineItemState[]>([]);
    const [editTaxPercent, setEditTaxPercent] = useState(0);

    function addItem() {
        setItems([...items, { key: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0, type: 'service' }]);
    }

    function updateItem(index: number, field: keyof LineItemState, value: string | number) {
        setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    }

    function removeItem(index: number) {
        setItems(items.filter((_, i) => i !== index));
    }

    function addEditItem() {
        setEditItems([...editItems, { key: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0, type: 'service' }]);
    }

    function updateEditItem(index: number, field: keyof LineItemState, value: string | number) {
        setEditItems(editItems.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    }

    function removeEditItem(index: number) {
        setEditItems(editItems.filter((_, i) => i !== index));
    }

    useEffect(() => {
        if (!createOpen) {
            setItems([]);
            setTaxPercent(0);
        }
    }, [createOpen]);

    useEffect(() => {
        if (editingInvoice) {
            const invoiceItems: InvoiceItemData[] = (editingInvoice as InvoiceData).items ?? [];
            setEditItems(invoiceItems.map((item) => ({
                key: crypto.randomUUID(),
                description: item.description,
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price),
                type: item.type as 'service' | 'product',
            })));
            const sub = Number(editingInvoice.subtotal);
            const tax = Number(editingInvoice.tax);
            setEditTaxPercent(sub > 0 ? (tax / sub) * 100 : 0);
        } else {
            setEditItems([]);
            setEditTaxPercent(0);
        }
    }, [editingInvoice]);

    function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const values: Record<string, unknown> = {};
        for (const [key, value] of formData) {
            values[key] = value === '' ? null : value;
        }
        values.items = items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            type: item.type,
        }));
        const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
        values.subtotal = subtotal;
        values.tax = taxPercent;
        values.total = subtotal + (subtotal * taxPercent / 100);
        router.post(invoices.store.url(), values, {
            onSuccess: () => setCreateOpen(false),
            onError: () => {},
        });
    }

    function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingInvoice) return;
        const form = e.currentTarget;
        const formData = new FormData(form);
        const values: Record<string, unknown> = {};
        for (const [key, value] of formData) {
            values[key] = value === '' ? null : value;
        }
        values.items = editItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            type: item.type,
        }));
        const subtotal = editItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
        values.subtotal = subtotal;
        values.tax = editTaxPercent;
        values.total = subtotal + (subtotal * editTaxPercent / 100);
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
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Line Items</Label>
                                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                                <Plus /> Add Item
                                            </Button>
                                        </div>
                                        {items.length === 0 ? (
                                            <p className="text-sm text-muted-foreground italic">No items added yet.</p>
                                        ) : (
                                            <div className="overflow-x-auto border rounded-md">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b bg-muted/50">
                                                            <th className="p-2 text-left font-medium">Description</th>
                                                            <th className="p-2 text-left font-medium">Type</th>
                                                            <th className="p-2 text-right font-medium">Qty</th>
                                                            <th className="p-2 text-right font-medium">Price</th>
                                                            <th className="p-2 text-right font-medium">Total</th>
                                                            <th className="p-2 w-10"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {items.map((item, index) => (
                                                            <tr key={item.key} className="border-b last:border-0">
                                                                <td className="p-1">
                                                                    <Input
                                                                        value={item.description}
                                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                                        placeholder="Description"
                                                                        className="h-8 text-xs"
                                                                    />
                                                                </td>
                                                                <td className="p-1">
                                                                    <select
                                                                        value={item.type}
                                                                        onChange={(e) => updateItem(index, 'type', e.target.value)}
                                                                        className="border-input h-8 w-full rounded-md border bg-transparent px-2 text-xs"
                                                                    >
                                                                        <option value="service">Service</option>
                                                                        <option value="product">Product</option>
                                                                    </select>
                                                                </td>
                                                                <td className="p-1">
                                                                    <Input
                                                                        type="number"
                                                                        min="1"
                                                                        value={item.quantity}
                                                                        onChange={(e) => updateItem(index, 'quantity', Math.max(1, Number(e.target.value)))}
                                                                        className="h-8 text-xs text-right"
                                                                    />
                                                                </td>
                                                                <td className="p-1">
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        min="0"
                                                                        value={item.unit_price}
                                                                        onChange={(e) => updateItem(index, 'unit_price', Math.max(0, Number(e.target.value)))}
                                                                        className="h-8 text-xs text-right"
                                                                    />
                                                                </td>
                                                                <td className="p-1 text-right text-xs font-medium">
                                                                    ${(item.quantity * item.unit_price).toFixed(2)}
                                                                </td>
                                                                <td className="p-1 text-center">
                                                                    <button type="button" onClick={() => removeItem(index)} className="text-destructive hover:text-destructive/80">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                        <div className="flex justify-end">
                                            <div className="w-48 space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span>Subtotal:</span>
                                                    <span>${items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm items-center gap-2">
                                                    <span>Tax:</span>
                                                    <div className="flex items-center gap-1">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.1"
                                                            value={taxPercent}
                                                            onChange={(e) => setTaxPercent(Math.max(0, Number(e.target.value)))}
                                                            className="h-7 w-20 text-xs text-right"
                                                        />
                                                        <span className="text-xs text-muted-foreground">%</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm font-semibold border-t pt-1">
                                                    <span>Total:</span>
                                                    <span>${(() => {
                                                        const sub = items.reduce((s, item) => s + item.quantity * item.unit_price, 0);
                                                        return (sub + sub * taxPercent / 100).toFixed(2);
                                                    })()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {errors.items && <p className="text-sm text-destructive">{errors.items}</p>}
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
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Line Items</Label>
                                            <Button type="button" variant="outline" size="sm" onClick={addEditItem}>
                                                <Plus /> Add Item
                                            </Button>
                                        </div>
                                        {editItems.length === 0 ? (
                                            <p className="text-sm text-muted-foreground italic">No items added yet.</p>
                                        ) : (
                                            <div className="overflow-x-auto border rounded-md">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b bg-muted/50">
                                                            <th className="p-2 text-left font-medium">Description</th>
                                                            <th className="p-2 text-left font-medium">Type</th>
                                                            <th className="p-2 text-right font-medium">Qty</th>
                                                            <th className="p-2 text-right font-medium">Price</th>
                                                            <th className="p-2 text-right font-medium">Total</th>
                                                            <th className="p-2 w-10"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {editItems.map((item, index) => (
                                                            <tr key={item.key} className="border-b last:border-0">
                                                                <td className="p-1">
                                                                    <Input
                                                                        value={item.description}
                                                                        onChange={(e) => updateEditItem(index, 'description', e.target.value)}
                                                                        placeholder="Description"
                                                                        className="h-8 text-xs"
                                                                    />
                                                                </td>
                                                                <td className="p-1">
                                                                    <select
                                                                        value={item.type}
                                                                        onChange={(e) => updateEditItem(index, 'type', e.target.value)}
                                                                        className="border-input h-8 w-full rounded-md border bg-transparent px-2 text-xs"
                                                                    >
                                                                        <option value="service">Service</option>
                                                                        <option value="product">Product</option>
                                                                    </select>
                                                                </td>
                                                                <td className="p-1">
                                                                    <Input
                                                                        type="number"
                                                                        min="1"
                                                                        value={item.quantity}
                                                                        onChange={(e) => updateEditItem(index, 'quantity', Math.max(1, Number(e.target.value)))}
                                                                        className="h-8 text-xs text-right"
                                                                    />
                                                                </td>
                                                                <td className="p-1">
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        min="0"
                                                                        value={item.unit_price}
                                                                        onChange={(e) => updateEditItem(index, 'unit_price', Math.max(0, Number(e.target.value)))}
                                                                        className="h-8 text-xs text-right"
                                                                    />
                                                                </td>
                                                                <td className="p-1 text-right text-xs font-medium">
                                                                    ${(item.quantity * item.unit_price).toFixed(2)}
                                                                </td>
                                                                <td className="p-1 text-center">
                                                                    <button type="button" onClick={() => removeEditItem(index)} className="text-destructive hover:text-destructive/80">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                        <div className="flex justify-end">
                                            <div className="w-48 space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span>Subtotal:</span>
                                                    <span>${editItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm items-center gap-2">
                                                    <span>Tax:</span>
                                                    <div className="flex items-center gap-1">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.1"
                                                            value={editTaxPercent}
                                                            onChange={(e) => setEditTaxPercent(Math.max(0, Number(e.target.value)))}
                                                            className="h-7 w-20 text-xs text-right"
                                                        />
                                                        <span className="text-xs text-muted-foreground">%</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm font-semibold border-t pt-1">
                                                    <span>Total:</span>
                                                    <span>${(() => {
                                                        const sub = editItems.reduce((s, item) => s + item.quantity * item.unit_price, 0);
                                                        return (sub + sub * editTaxPercent / 100).toFixed(2);
                                                    })()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {errors.items && <p className="text-sm text-destructive">{errors.items}</p>}
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
