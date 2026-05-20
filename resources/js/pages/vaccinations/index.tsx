import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import vaccinations from '@/routes/vaccinations';
import { formatDate } from '@/lib/utils';

interface Pet { id: number; name: string; client: { id: number; name: string } }
interface Veterinarian { id: number; name: string }

interface VaccinationData {
    id: number;
    vaccine_name: string;
    date_administered: string;
    next_due_date: string | null;
    batch_number: string | null;
    manufacturer: string | null;
    notes: string | null;
    pet: Pet;
    veterinarian: Veterinarian;
}

interface PaginatedData {
    data: VaccinationData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Filters {
    pet_id?: string;
    overdue?: string;
    search?: string;
}

interface Props {
    vaccinations: PaginatedData;
    pets: Pet[];
    veterinarians: Veterinarian[];
    filters?: Filters;
}

export default function VaccinationsIndex({ vaccinations: data, pets: allPets, veterinarians, filters }: Props) {
    const [searchValue, setSearchValue] = React.useState(filters?.search ?? '');
    const [createOpen, setCreateOpen] = React.useState(false);
    const [editingVaccination, setEditingVaccination] = React.useState<VaccinationData | null>(null);
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
        router.post(vaccinations.store.url(), values, {
            onSuccess: () => setCreateOpen(false),
            onError: () => {},
        });
    }

    function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingVaccination) return;
        const values = formToJson(e.currentTarget);
        router.put(vaccinations.update.url(editingVaccination.id), values, {
            onSuccess: () => setEditingVaccination(null),
            onError: () => {},
        });
    }

    function handleSearch() {
        router.get(vaccinations.index.url({ query: { search: searchValue || null, page: null } }));
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') handleSearch();
    }

    function clearSearch() {
        setSearchValue('');
        router.get(vaccinations.index.url({ query: { search: null, page: null } }));
    }

    return (
        <>
            <Head title="Vaccinations" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold tracking-tight">Vaccinations</h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Search vaccinations..."
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
                            <DialogTrigger asChild><Button><Plus /> Add Vaccination</Button></DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Add Vaccination</DialogTitle>
                                    <DialogDescription>Record a vaccination.</DialogDescription>
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
                                                <Label htmlFor="veterinarian_id">Administered By</Label>
                                                <select id="veterinarian_id" name="veterinarian_id" required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                    <option value="">Select vet...</option>
                                                    {veterinarians.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                                </select>
                                                {errors.veterinarian_id && <p className="text-sm text-destructive">{errors.veterinarian_id}</p>}
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="vaccine_name">Vaccine Name</Label>
                                            <Input id="vaccine_name" name="vaccine_name" required />
                                            {errors.vaccine_name && <p className="text-sm text-destructive">{errors.vaccine_name}</p>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="manufacturer">Manufacturer</Label>
                                                <Input id="manufacturer" name="manufacturer" />
                                                {errors.manufacturer && <p className="text-sm text-destructive">{errors.manufacturer}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="batch_number">Batch Number</Label>
                                                <Input id="batch_number" name="batch_number" />
                                                {errors.batch_number && <p className="text-sm text-destructive">{errors.batch_number}</p>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="date_administered">Date Administered</Label>
                                                <Input id="date_administered" name="date_administered" type="date" required />
                                                {errors.date_administered && <p className="text-sm text-destructive">{errors.date_administered}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="next_due_date">Next Due Date</Label>
                                                <Input id="next_due_date" name="next_due_date" type="date" />
                                                {errors.next_due_date && <p className="text-sm text-destructive">{errors.next_due_date}</p>}
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="notes">Notes</Label>
                                            <textarea id="notes" name="notes" className="border-input flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
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
                </div>

                {/* Edit Vaccination Dialog */}
                <Dialog open={editingVaccination !== null} onOpenChange={(open) => { if (!open) setEditingVaccination(null); }}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Edit Vaccination</DialogTitle>
                            <DialogDescription>Update vaccination record.</DialogDescription>
                        </DialogHeader>
                        {editingVaccination && (
                            <form onSubmit={handleEditSubmit} key={editingVaccination.id}>
                                <div className="max-h-[65vh] overflow-y-auto space-y-4 px-px">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-pet_id">Pet</Label>
                                            <select id="edit-pet_id" name="pet_id" required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" defaultValue={editingVaccination.pet.id}>
                                                <option value="">Select pet...</option>
                                                {allPets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                            {errors.pet_id && <p className="text-sm text-destructive">{errors.pet_id}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-veterinarian_id">Administered By</Label>
                                            <select id="edit-veterinarian_id" name="veterinarian_id" required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" defaultValue={editingVaccination.veterinarian.id}>
                                                <option value="">Select vet...</option>
                                                {veterinarians.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                            </select>
                                            {errors.veterinarian_id && <p className="text-sm text-destructive">{errors.veterinarian_id}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-vaccine_name">Vaccine Name</Label>
                                        <Input id="edit-vaccine_name" name="vaccine_name" defaultValue={editingVaccination.vaccine_name} required />
                                        {errors.vaccine_name && <p className="text-sm text-destructive">{errors.vaccine_name}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-manufacturer">Manufacturer</Label>
                                            <Input id="edit-manufacturer" name="manufacturer" defaultValue={editingVaccination.manufacturer ?? ''} />
                                            {errors.manufacturer && <p className="text-sm text-destructive">{errors.manufacturer}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-batch_number">Batch Number</Label>
                                            <Input id="edit-batch_number" name="batch_number" defaultValue={editingVaccination.batch_number ?? ''} />
                                            {errors.batch_number && <p className="text-sm text-destructive">{errors.batch_number}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-date_administered">Date Administered</Label>
                                            <Input id="edit-date_administered" name="date_administered" type="date" defaultValue={editingVaccination.date_administered} required />
                                            {errors.date_administered && <p className="text-sm text-destructive">{errors.date_administered}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-next_due_date">Next Due Date</Label>
                                            <Input id="edit-next_due_date" name="next_due_date" type="date" defaultValue={editingVaccination.next_due_date ?? ''} />
                                            {errors.next_due_date && <p className="text-sm text-destructive">{errors.next_due_date}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-notes">Notes</Label>
                                        <textarea id="edit-notes" name="notes" defaultValue={editingVaccination.notes ?? ''} className="border-input flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
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
                    <CardHeader><CardTitle>Vaccination Records</CardTitle></CardHeader>
                    <CardContent>
                        {data.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No vaccinations recorded.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium">Pet</th>
                                            <th className="pb-3 font-medium">Vaccine</th>
                                            <th className="pb-3 font-medium">Date Given</th>
                                            <th className="pb-3 font-medium">Next Due</th>
                                            <th className="pb-3 font-medium">Batch</th>
                                            <th className="pb-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.data.map((v) => (
                                            <tr key={v.id} className="border-b last:border-0">
                                                <td className="py-3 font-medium">{v.pet.name}</td>
                                                <td className="py-3">{v.vaccine_name}</td>
                                                <td className="py-3">{formatDate(v.date_administered)}</td>
                                                <td className="py-3">
                                                    {v.next_due_date ? (
                                                        <Badge variant={new Date(v.next_due_date) < new Date() ? 'destructive' : 'outline'}>
                                                            {formatDate(v.next_due_date)}
                                                        </Badge>
                                                    ) : '—'}
                                                </td>
                                                <td className="py-3 text-muted-foreground font-mono text-xs">{v.batch_number ?? '—'}</td>
                                                <td className="py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => setEditingVaccination(v)}>
                                                            <Pencil />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete this vaccination record?')) router.delete(vaccinations.destroy.url(v.id)); }}>
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
                                    {data.current_page > 1 && <Button variant="outline" size="sm" onClick={() => router.get(vaccinations.index.url({ query: { page: data.current_page - 1, search: searchValue || undefined } }))}>Previous</Button>}
                                    {data.current_page < data.last_page && <Button variant="outline" size="sm" onClick={() => router.get(vaccinations.index.url({ query: { page: data.current_page + 1, search: searchValue || undefined } }))}>Next</Button>}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

VaccinationsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Vaccinations', href: vaccinations.index() },
    ],
};
