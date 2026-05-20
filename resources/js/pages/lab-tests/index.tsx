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
import labTests from '@/routes/lab-tests';

interface LabTestData {
    id: number;
    name: string;
    description: string | null;
    category: string | null;
    price: number;
    is_active: boolean;
}

interface PaginatedData {
    data: LabTestData[];
    current_page: number; last_page: number; per_page: number; total: number; from: number; to: number;
}

interface Props {
    labTests: PaginatedData;
    filters: { search?: string; is_active?: string };
}

export default function LabTestsIndex({ labTests: data, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [activeFilter, setActiveFilter] = useState(filters?.is_active ?? '');
    const [createOpen, setCreateOpen] = useState(false);
    const [editingLabTest, setEditingLabTest] = useState<LabTestData | null>(null);
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
        router.post(labTests.store.url(), values, {
            onSuccess: () => setCreateOpen(false),
            onError: () => {},
        });
    }

    function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingLabTest) return;
        const values = formToJson(e.currentTarget);
        router.put(labTests.update.url(editingLabTest.id), values, {
            onSuccess: () => setEditingLabTest(null),
            onError: () => {},
        });
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(labTests.index.url(), { search, is_active: activeFilter || undefined }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [search, activeFilter]);

    function clearFilters() {
        setSearch('');
        setActiveFilter('');
        router.get(labTests.index.url());
    }

    const hasFilters = search || activeFilter;

    return (
        <>
            <Head title="Lab Tests" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold tracking-tight">Lab Tests</h1>
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus /> Add Lab Test</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Add Lab Test</DialogTitle>
                                <DialogDescription>Create a new lab test.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateSubmit}>
                                <div className="max-h-[65vh] overflow-y-auto space-y-4 px-px">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" name="name" required />
                                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <textarea id="description" name="description" className="border-input flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category">Category</Label>
                                        <select id="category" name="category" className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                            <option value="">Select category...</option>
                                            <option value="Blood">Blood</option>
                                            <option value="Urine">Urine</option>
                                            <option value="Imaging">Imaging</option>
                                            <option value="Microbiology">Microbiology</option>
                                            <option value="Pathology">Pathology</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="price">Price</Label>
                                        <Input id="price" name="price" type="number" step="0.01" min="0" required />
                                        {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
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
                            placeholder="Search by name or category..."
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
                        <option value="">All tests</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            <X className="h-4 w-4 mr-1" /> Clear
                        </Button>
                    )}
                </div>

                {/* Edit Lab Test Dialog */}
                <Dialog open={editingLabTest !== null} onOpenChange={(open) => { if (!open) setEditingLabTest(null); }}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Edit Lab Test</DialogTitle>
                            <DialogDescription>Update lab test.</DialogDescription>
                        </DialogHeader>
                        {editingLabTest && (
                            <form onSubmit={handleEditSubmit} key={editingLabTest.id}>
                                <div className="max-h-[65vh] overflow-y-auto space-y-4 px-px">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-name">Name</Label>
                                        <Input id="edit-name" name="name" defaultValue={editingLabTest.name} required />
                                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-description">Description</Label>
                                        <textarea id="edit-description" name="description" defaultValue={editingLabTest.description ?? ''} className="border-input flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-category">Category</Label>
                                        <select id="edit-category" name="category" defaultValue={editingLabTest.category ?? ''} className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                            <option value="">Select category...</option>
                                            <option value="Blood">Blood</option>
                                            <option value="Urine">Urine</option>
                                            <option value="Imaging">Imaging</option>
                                            <option value="Microbiology">Microbiology</option>
                                            <option value="Pathology">Pathology</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-price">Price</Label>
                                        <Input id="edit-price" name="price" type="number" step="0.01" min="0" defaultValue={editingLabTest.price} required />
                                        {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input id="edit-is_active" name="is_active" type="checkbox" value="1" defaultChecked={editingLabTest.is_active} className="h-4 w-4 rounded border-gray-300" />
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
                        <CardTitle>All Lab Tests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No lab tests found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium">Name</th>
                                            <th className="pb-3 font-medium">Category</th>
                                            <th className="pb-3 font-medium">Price</th>
                                            <th className="pb-3 font-medium">Status</th>
                                            <th className="pb-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.data.map((item) => (
                                            <tr key={item.id} className="border-b last:border-0">
                                                <td className="py-3 font-medium">
                                                    <Link href={labTests.show(item.id)} className="hover:underline">{item.name}</Link>
                                                </td>
                                                <td className="py-3">{item.category ?? '—'}</td>
                                                <td className="py-3">${Number(item.price).toFixed(2)}</td>
                                                <td className="py-3">
                                                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
                                                        {item.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={labTests.show(item.id)}>
                                                            <Button variant="ghost" size="sm">View</Button>
                                                        </Link>
                                                        <Button variant="ghost" size="sm" onClick={() => setEditingLabTest(item)}>
                                                            <Pencil />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete this lab test?')) router.delete(labTests.destroy.url(item.id)); }}>
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
                                    {data.current_page > 1 && <Button variant="outline" size="sm" onClick={() => router.get(labTests.index.url({ query: { page: data.current_page - 1, search: search || undefined, is_active: activeFilter || undefined } }))}>Previous</Button>}
                                    {data.current_page < data.last_page && <Button variant="outline" size="sm" onClick={() => router.get(labTests.index.url({ query: { page: data.current_page + 1, search: search || undefined, is_active: activeFilter || undefined } }))}>Next</Button>}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

LabTestsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Lab Tests', href: labTests.index() },
    ],
};
