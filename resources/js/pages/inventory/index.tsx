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
import inventory from '@/routes/inventory';

interface InventoryItemData {
    id: number;
    name: string;
    sku: string;
    category: string | null;
    description: string | null;
    quantity_on_hand: number;
    reorder_level: number;
    unit_price: number;
    selling_price: number;
    supplier: string | null;
    expiry_date: string | null;
    is_active: boolean;
}

interface PaginatedData {
    data: InventoryItemData[];
    current_page: number; last_page: number; per_page: number; total: number; from: number; to: number;
}

interface Props {
    items: PaginatedData;
    filters: { search?: string; is_active?: string };
}

export default function InventoryIndex({ items, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [activeFilter, setActiveFilter] = useState(filters?.is_active ?? '');
    const [createOpen, setCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItemData | null>(null);
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
        router.post(inventory.store.url(), values, {
            onSuccess: () => setCreateOpen(false),
            onError: () => {},
        });
    }

    function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingItem) return;
        const values = formToJson(e.currentTarget);
        router.put(inventory.update.url(editingItem.id), values, {
            onSuccess: () => setEditingItem(null),
            onError: () => {},
        });
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(inventory.index.url(), { search, is_active: activeFilter || undefined }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [search, activeFilter]);

    function clearFilters() {
        setSearch('');
        setActiveFilter('');
        router.get(inventory.index.url());
    }

    const hasFilters = search || activeFilter;

    const data = items;

    return (
        <>
            <Head title="Inventory" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold tracking-tight">Inventory</h1>
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus /> Add Item</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Add Inventory Item</DialogTitle>
                                <DialogDescription>Add a new item to inventory.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateSubmit}>
                                <div className="max-h-[65vh] overflow-y-auto space-y-4 px-px">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input id="name" name="name" required />
                                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="sku">SKU</Label>
                                            <Input id="sku" name="sku" required />
                                            {errors.sku && <p className="text-sm text-destructive">{errors.sku}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category">Category</Label>
                                        <select id="category" name="category" className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                            <option value="">Select category...</option>
                                            <option value="Medication">Medication</option>
                                            <option value="Surgical">Surgical</option>
                                            <option value="Consumable">Consumable</option>
                                            <option value="Equipment">Equipment</option>
                                            <option value="Vaccine">Vaccine</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <textarea id="description" name="description" className="border-input flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="quantity_on_hand">Quantity On Hand</Label>
                                            <Input id="quantity_on_hand" name="quantity_on_hand" type="number" min="0" required />
                                            {errors.quantity_on_hand && <p className="text-sm text-destructive">{errors.quantity_on_hand}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="reorder_level">Reorder Level</Label>
                                            <Input id="reorder_level" name="reorder_level" type="number" min="0" required />
                                            {errors.reorder_level && <p className="text-sm text-destructive">{errors.reorder_level}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="unit_price">Unit Price</Label>
                                            <Input id="unit_price" name="unit_price" type="number" step="0.01" min="0" required />
                                            {errors.unit_price && <p className="text-sm text-destructive">{errors.unit_price}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="selling_price">Selling Price</Label>
                                            <Input id="selling_price" name="selling_price" type="number" step="0.01" min="0" required />
                                            {errors.selling_price && <p className="text-sm text-destructive">{errors.selling_price}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="supplier">Supplier</Label>
                                            <Input id="supplier" name="supplier" />
                                            {errors.supplier && <p className="text-sm text-destructive">{errors.supplier}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="expiry_date">Expiry Date</Label>
                                            <Input id="expiry_date" name="expiry_date" type="date" />
                                            {errors.expiry_date && <p className="text-sm text-destructive">{errors.expiry_date}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input id="is_active" name="is_active" type="checkbox" value="1" defaultChecked className="h-4 w-4 rounded border-gray-300" />
                                        <Label htmlFor="is_active">Is Active</Label>
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
                            placeholder="Search by name, SKU, category or supplier..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <select
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value)}
                        className="border-input flex h-9 w-40 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                    >
                        <option value="">All items</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            <X className="h-4 w-4 mr-1" /> Clear
                        </Button>
                    )}
                </div>

                {/* Edit Inventory Item Dialog */}
                <Dialog open={editingItem !== null} onOpenChange={(open) => { if (!open) setEditingItem(null); }}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Edit Inventory Item</DialogTitle>
                            <DialogDescription>Update inventory item.</DialogDescription>
                        </DialogHeader>
                        {editingItem && (
                            <form onSubmit={handleEditSubmit} key={editingItem.id}>
                                <div className="max-h-[65vh] overflow-y-auto space-y-4 px-px">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-name">Name</Label>
                                            <Input id="edit-name" name="name" defaultValue={editingItem.name} required />
                                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-sku">SKU</Label>
                                            <Input id="edit-sku" name="sku" defaultValue={editingItem.sku} required />
                                            {errors.sku && <p className="text-sm text-destructive">{errors.sku}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-category">Category</Label>
                                        <select id="edit-category" name="category" defaultValue={editingItem.category ?? ''} className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                            <option value="">Select category...</option>
                                            <option value="Medication">Medication</option>
                                            <option value="Surgical">Surgical</option>
                                            <option value="Consumable">Consumable</option>
                                            <option value="Equipment">Equipment</option>
                                            <option value="Vaccine">Vaccine</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-description">Description</Label>
                                        <textarea id="edit-description" name="description" defaultValue={editingItem.description ?? ''} className="border-input flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-quantity_on_hand">Quantity On Hand</Label>
                                            <Input id="edit-quantity_on_hand" name="quantity_on_hand" type="number" min="0" defaultValue={editingItem.quantity_on_hand} required />
                                            {errors.quantity_on_hand && <p className="text-sm text-destructive">{errors.quantity_on_hand}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-reorder_level">Reorder Level</Label>
                                            <Input id="edit-reorder_level" name="reorder_level" type="number" min="0" defaultValue={editingItem.reorder_level} required />
                                            {errors.reorder_level && <p className="text-sm text-destructive">{errors.reorder_level}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-unit_price">Unit Price</Label>
                                            <Input id="edit-unit_price" name="unit_price" type="number" step="0.01" min="0" defaultValue={editingItem.unit_price} required />
                                            {errors.unit_price && <p className="text-sm text-destructive">{errors.unit_price}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-selling_price">Selling Price</Label>
                                            <Input id="edit-selling_price" name="selling_price" type="number" step="0.01" min="0" defaultValue={editingItem.selling_price} required />
                                            {errors.selling_price && <p className="text-sm text-destructive">{errors.selling_price}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-supplier">Supplier</Label>
                                            <Input id="edit-supplier" name="supplier" defaultValue={editingItem.supplier ?? ''} />
                                            {errors.supplier && <p className="text-sm text-destructive">{errors.supplier}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-expiry_date">Expiry Date</Label>
                                            <Input id="edit-expiry_date" name="expiry_date" type="date" defaultValue={editingItem.expiry_date ?? ''} />
                                            {errors.expiry_date && <p className="text-sm text-destructive">{errors.expiry_date}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input id="edit-is_active" name="is_active" type="checkbox" value="1" defaultChecked={editingItem.is_active} className="h-4 w-4 rounded border-gray-300" />
                                        <Label htmlFor="edit-is_active">Is Active</Label>
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
                        <CardTitle>All Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No inventory items found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium">Name</th>
                                            <th className="pb-3 font-medium">SKU</th>
                                            <th className="pb-3 font-medium">Category</th>
                                            <th className="pb-3 font-medium">Qty On Hand</th>
                                            <th className="pb-3 font-medium">Reorder Level</th>
                                            <th className="pb-3 font-medium">Selling Price</th>
                                            <th className="pb-3 font-medium">Status</th>
                                            <th className="pb-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.data.map((item) => {
                                            const isLowStock = item.quantity_on_hand <= item.reorder_level;
                                            return (
                                                <tr key={item.id} className={`border-b last:border-0 ${isLowStock ? 'bg-red-50 dark:bg-red-950/20' : ''}`}>
                                                    <td className="py-3 font-medium">
                                                        <Link href={inventory.show(item.id)} className="hover:underline">{item.name}</Link>
                                                    </td>
                                                    <td className="py-3 text-muted-foreground">{item.sku}</td>
                                                    <td className="py-3">{item.category ?? '—'}</td>
                                                    <td className="py-3">
                                                        <span className={isLowStock ? 'font-semibold text-destructive' : ''}>
                                                            {item.quantity_on_hand}
                                                        </span>
                                                        {isLowStock && (
                                                            <Badge variant="destructive" className="ml-2">Low Stock</Badge>
                                                        )}
                                                    </td>
                                                    <td className="py-3">{item.reorder_level}</td>
                                                    <td className="py-3">${Number(item.selling_price).toFixed(2)}</td>
                                                    <td className="py-3">
                                                        <Badge variant={item.is_active ? 'default' : 'secondary'}>
                                                            {item.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Link href={inventory.show(item.id)}>
                                                                <Button variant="ghost" size="sm">View</Button>
                                                            </Link>
                                                            <Button variant="ghost" size="sm" onClick={() => setEditingItem(item)}>
                                                                <Pencil />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete this item?')) router.delete(inventory.destroy.url(item.id)); }}>
                                                                <Trash2 className="text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {data.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Showing {data.from} to {data.to} of {data.total}</p>
                                <div className="flex gap-2">
                                    {data.current_page > 1 && <Button variant="outline" size="sm" onClick={() => router.get(inventory.index.url({ query: { page: data.current_page - 1, search: search || undefined, is_active: activeFilter || undefined } }), {}, { preserveState: true })}>Previous</Button>}
                                    {data.current_page < data.last_page && <Button variant="outline" size="sm" onClick={() => router.get(inventory.index.url({ query: { page: data.current_page + 1, search: search || undefined, is_active: activeFilter || undefined } }), {}, { preserveState: true })}>Next</Button>}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

InventoryIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Inventory', href: inventory.index() },
    ],
};
