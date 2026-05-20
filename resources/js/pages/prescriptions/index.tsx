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
import { dashboard } from '@/routes';
import prescriptions from '@/routes/prescriptions';

interface Pet { id: number; name: string; client: { id: number; name: string } }
interface Veterinarian { id: number; name: string }

interface PrescriptionData {
    id: number;
    medication_name: string;
    dosage: string;
    frequency: string;
    route: string | null;
    duration: string | null;
    quantity: number | null;
    refills: number | null;
    notes: string | null;
    start_date: string | null;
    end_date: string | null;
    pet: Pet;
    veterinarian: Veterinarian;
}

interface PaginatedData {
    data: PrescriptionData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Filters {
    pet_id?: string;
    search?: string;
}

interface Props {
    prescriptions: PaginatedData;
    pets: Pet[];
    veterinarians: Veterinarian[];
    filters?: Filters;
}

export default function PrescriptionsIndex({ prescriptions: data, pets: allPets, veterinarians, filters }: Props) {
    const [searchValue, setSearchValue] = React.useState(filters?.search ?? '');
    const [createOpen, setCreateOpen] = React.useState(false);
    const [editingPrescription, setEditingPrescription] = React.useState<PrescriptionData | null>(null);
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
        router.post(prescriptions.store.url(), values, {
            onSuccess: () => setCreateOpen(false),
            onError: () => {},
        });
    }

    function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingPrescription) return;
        const values = formToJson(e.currentTarget);
        router.put(prescriptions.update.url(editingPrescription.id), values, {
            onSuccess: () => setEditingPrescription(null),
            onError: () => {},
        });
    }

    function handleSearch() {
        router.get(prescriptions.index.url({ query: { search: searchValue || null, page: null } }));
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') handleSearch();
    }

    function clearSearch() {
        setSearchValue('');
        router.get(prescriptions.index.url({ query: { search: null, page: null } }));
    }

    return (
        <>
            <Head title="Prescriptions" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold tracking-tight">Prescriptions</h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Search prescriptions..."
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
                            <DialogTrigger asChild><Button><Plus /> Add Prescription</Button></DialogTrigger>
                            <DialogContent className="sm:max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>Add Prescription</DialogTitle>
                                    <DialogDescription>Prescribe medication for a pet.</DialogDescription>
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
                                                <Label htmlFor="veterinarian_id">Prescribed By</Label>
                                                <select id="veterinarian_id" name="veterinarian_id" required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                    <option value="">Select vet...</option>
                                                    {veterinarians.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                                </select>
                                                {errors.veterinarian_id && <p className="text-sm text-destructive">{errors.veterinarian_id}</p>}
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="medication_name">Medication Name</Label>
                                            <Input id="medication_name" name="medication_name" required />
                                            {errors.medication_name && <p className="text-sm text-destructive">{errors.medication_name}</p>}
                                        </div>

                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b pb-1">Dosage Instructions</p>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="dosage">Dosage</Label>
                                                <Input id="dosage" name="dosage" required placeholder="e.g. 50mg" />
                                                {errors.dosage && <p className="text-sm text-destructive">{errors.dosage}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="frequency">Frequency</Label>
                                                <Input id="frequency" name="frequency" required placeholder="e.g. twice daily" />
                                                {errors.frequency && <p className="text-sm text-destructive">{errors.frequency}</p>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="route">Route</Label>
                                                <Input id="route" name="route" placeholder="oral, topical, etc." />
                                                {errors.route && <p className="text-sm text-destructive">{errors.route}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="duration">Duration</Label>
                                                <Input id="duration" name="duration" placeholder="e.g. 7 days" />
                                                {errors.duration && <p className="text-sm text-destructive">{errors.duration}</p>}
                                            </div>
                                        </div>

                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b pb-1">Dispensing</p>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="quantity">Quantity</Label>
                                                <Input id="quantity" name="quantity" type="number" />
                                                {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="refills">Refills</Label>
                                                <Input id="refills" name="refills" type="number" defaultValue={0} />
                                                {errors.refills && <p className="text-sm text-destructive">{errors.refills}</p>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="start_date">Start Date</Label>
                                                <Input id="start_date" name="start_date" type="date" />
                                                {errors.start_date && <p className="text-sm text-destructive">{errors.start_date}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="end_date">End Date</Label>
                                                <Input id="end_date" name="end_date" type="date" />
                                                {errors.end_date && <p className="text-sm text-destructive">{errors.end_date}</p>}
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

                {/* Edit Prescription Dialog */}
                <Dialog open={editingPrescription !== null} onOpenChange={(open) => { if (!open) setEditingPrescription(null); }}>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Edit Prescription</DialogTitle>
                            <DialogDescription>Update prescription details.</DialogDescription>
                        </DialogHeader>
                        {editingPrescription && (
                            <form onSubmit={handleEditSubmit} key={editingPrescription.id}>
                                <div className="max-h-[65vh] overflow-y-auto space-y-4 px-px">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-pet_id">Pet</Label>
                                            <select id="edit-pet_id" name="pet_id" required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" defaultValue={editingPrescription.pet.id}>
                                                <option value="">Select pet...</option>
                                                {allPets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                            {errors.pet_id && <p className="text-sm text-destructive">{errors.pet_id}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-veterinarian_id">Prescribed By</Label>
                                            <select id="edit-veterinarian_id" name="veterinarian_id" required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" defaultValue={editingPrescription.veterinarian.id}>
                                                <option value="">Select vet...</option>
                                                {veterinarians.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                            </select>
                                            {errors.veterinarian_id && <p className="text-sm text-destructive">{errors.veterinarian_id}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-medication_name">Medication Name</Label>
                                        <Input id="edit-medication_name" name="medication_name" defaultValue={editingPrescription.medication_name} required />
                                        {errors.medication_name && <p className="text-sm text-destructive">{errors.medication_name}</p>}
                                    </div>

                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b pb-1">Dosage Instructions</p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-dosage">Dosage</Label>
                                            <Input id="edit-dosage" name="dosage" defaultValue={editingPrescription.dosage} required placeholder="e.g. 50mg" />
                                            {errors.dosage && <p className="text-sm text-destructive">{errors.dosage}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-frequency">Frequency</Label>
                                            <Input id="edit-frequency" name="frequency" defaultValue={editingPrescription.frequency} required placeholder="e.g. twice daily" />
                                            {errors.frequency && <p className="text-sm text-destructive">{errors.frequency}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-route">Route</Label>
                                            <Input id="edit-route" name="route" defaultValue={editingPrescription.route ?? ''} placeholder="oral, topical, etc." />
                                            {errors.route && <p className="text-sm text-destructive">{errors.route}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-duration">Duration</Label>
                                            <Input id="edit-duration" name="duration" defaultValue={editingPrescription.duration ?? ''} placeholder="e.g. 7 days" />
                                            {errors.duration && <p className="text-sm text-destructive">{errors.duration}</p>}
                                        </div>
                                    </div>

                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b pb-1">Dispensing</p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-quantity">Quantity</Label>
                                            <Input id="edit-quantity" name="quantity" type="number" defaultValue={editingPrescription.quantity ?? ''} />
                                            {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-refills">Refills</Label>
                                            <Input id="edit-refills" name="refills" type="number" defaultValue={editingPrescription.refills ?? 0} />
                                            {errors.refills && <p className="text-sm text-destructive">{errors.refills}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-start_date">Start Date</Label>
                                            <Input id="edit-start_date" name="start_date" type="date" defaultValue={editingPrescription.start_date ?? ''} />
                                            {errors.start_date && <p className="text-sm text-destructive">{errors.start_date}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-end_date">End Date</Label>
                                            <Input id="edit-end_date" name="end_date" type="date" defaultValue={editingPrescription.end_date ?? ''} />
                                            {errors.end_date && <p className="text-sm text-destructive">{errors.end_date}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-notes">Notes</Label>
                                        <textarea id="edit-notes" name="notes" defaultValue={editingPrescription.notes ?? ''} className="border-input flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
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
                    <CardHeader><CardTitle>All Prescriptions</CardTitle></CardHeader>
                    <CardContent>
                        {data.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No prescriptions recorded.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium">Pet</th>
                                            <th className="pb-3 font-medium">Medication</th>
                                            <th className="pb-3 font-medium">Dosage</th>
                                            <th className="pb-3 font-medium">Frequency</th>
                                            <th className="pb-3 font-medium">Duration</th>
                                            <th className="pb-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.data.map((p) => (
                                            <tr key={p.id} className="border-b last:border-0">
                                                <td className="py-3 font-medium">{p.pet.name}</td>
                                                <td className="py-3">{p.medication_name}</td>
                                                <td className="py-3">{p.dosage}</td>
                                                <td className="py-3">{p.frequency}</td>
                                                <td className="py-3 text-muted-foreground">{p.duration ?? '—'}</td>
                                                <td className="py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => setEditingPrescription(p)}>
                                                            <Pencil />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete this prescription?')) router.delete(prescriptions.destroy.url(p.id)); }}>
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
                                    {data.current_page > 1 && <Button variant="outline" size="sm" onClick={() => router.get(prescriptions.index.url({ query: { page: data.current_page - 1, search: searchValue || undefined } }))}>Previous</Button>}
                                    {data.current_page < data.last_page && <Button variant="outline" size="sm" onClick={() => router.get(prescriptions.index.url({ query: { page: data.current_page + 1, search: searchValue || undefined } }))}>Next</Button>}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

PrescriptionsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Prescriptions', href: prescriptions.index() },
    ],
};
