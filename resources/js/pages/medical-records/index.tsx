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
import medicalRecords from '@/routes/medical-records';

interface Pet { id: number; name: string; client: { id: number; name: string } }
interface Veterinarian { id: number; name: string }

interface RecordData {
    id: number;
    visit_date: string;
    subjective: string | null;
    objective: string | null;
    assessment: string | null;
    plan: string | null;
    notes: string | null;
    temperature: string | null;
    heart_rate: string | null;
    respiratory_rate: string | null;
    weight: string | null;
    pet: Pet;
    veterinarian: Veterinarian;
}

interface PaginatedData {
    data: RecordData[];
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
    records: PaginatedData;
    pets: Pet[];
    veterinarians: Veterinarian[];
    filters?: Filters;
}

export default function MedicalRecordsIndex({ records, pets: allPets, veterinarians, filters }: Props) {
    const [searchValue, setSearchValue] = React.useState(filters?.search ?? '');
    const [createOpen, setCreateOpen] = React.useState(false);
    const [editingRecord, setEditingRecord] = React.useState<RecordData | null>(null);
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
        router.post(medicalRecords.store.url(), values, {
            onSuccess: () => setCreateOpen(false),
            onError: () => {},
        });
    }

    function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingRecord) return;
        const values = formToJson(e.currentTarget);
        router.put(medicalRecords.update.url(editingRecord.id), values, {
            onSuccess: () => setEditingRecord(null),
            onError: () => {},
        });
    }

    function handleSearch() {
        router.get(medicalRecords.index.url({ query: { search: searchValue || null, page: null } }));
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') handleSearch();
    }

    function clearSearch() {
        setSearchValue('');
        router.get(medicalRecords.index.url({ query: { search: null, page: null } }));
    }

    return (
        <>
            <Head title="Medical Records" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold tracking-tight">Medical Records</h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Search records..."
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
                            <DialogTrigger asChild><Button><Plus /> Add Record</Button></DialogTrigger>
                            <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Add Medical Record</DialogTitle>
                                    <DialogDescription>Record a new medical visit.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateSubmit}>
                                    <div className="max-h-[65vh] overflow-y-auto space-y-5 px-px">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="pet_id">Pet</Label>
                                                <select id="pet_id" name="pet_id" required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                                                    <option value="">Select pet...</option>
                                                    {allPets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.client.name})</option>)}
                                                </select>
                                                {errors.pet_id && <p className="text-sm text-destructive">{errors.pet_id}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="visit_date">Visit Date</Label>
                                                <Input id="visit_date" name="visit_date" type="date" required />
                                                {errors.visit_date && <p className="text-sm text-destructive">{errors.visit_date}</p>}
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
                                        </div>

                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b pb-1">SOAP Notes</p>

                                        <div className="grid gap-2">
                                            <Label htmlFor="subjective">Subjective <span className="text-muted-foreground font-normal">(Chief complaint, history)</span></Label>
                                            <textarea id="subjective" name="subjective" rows={3} className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                            {errors.subjective && <p className="text-sm text-destructive">{errors.subjective}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="objective">Objective <span className="text-muted-foreground font-normal">(Examination findings)</span></Label>
                                            <textarea id="objective" name="objective" rows={3} className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                            {errors.objective && <p className="text-sm text-destructive">{errors.objective}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="assessment">Assessment <span className="text-muted-foreground font-normal">(Diagnosis)</span></Label>
                                            <textarea id="assessment" name="assessment" rows={3} className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                            {errors.assessment && <p className="text-sm text-destructive">{errors.assessment}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="plan">Plan <span className="text-muted-foreground font-normal">(Treatment plan)</span></Label>
                                            <textarea id="plan" name="plan" rows={3} className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                            {errors.plan && <p className="text-sm text-destructive">{errors.plan}</p>}
                                        </div>

                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b pb-1">Vitals</p>

                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="temperature">Temperature</Label>
                                                <Input id="temperature" name="temperature" type="number" step="0.1" placeholder="°C" />
                                                {errors.temperature && <p className="text-sm text-destructive">{errors.temperature}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="heart_rate">Heart Rate</Label>
                                                <Input id="heart_rate" name="heart_rate" type="number" placeholder="bpm" />
                                                {errors.heart_rate && <p className="text-sm text-destructive">{errors.heart_rate}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="respiratory_rate">Resp. Rate</Label>
                                                <Input id="respiratory_rate" name="respiratory_rate" type="number" placeholder="/min" />
                                                {errors.respiratory_rate && <p className="text-sm text-destructive">{errors.respiratory_rate}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="weight">Weight</Label>
                                                <Input id="weight" name="weight" type="number" step="0.01" placeholder="kg" />
                                                {errors.weight && <p className="text-sm text-destructive">{errors.weight}</p>}
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="notes">Additional Notes</Label>
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
                </div>

                {/* Edit Medical Record Dialog */}
                <Dialog open={editingRecord !== null} onOpenChange={(open) => { if (!open) setEditingRecord(null); }}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Medical Record</DialogTitle>
                            <DialogDescription>Update medical visit record.</DialogDescription>
                        </DialogHeader>
                        {editingRecord && (
                            <form onSubmit={handleEditSubmit} key={editingRecord.id}>
                                <div className="max-h-[65vh] overflow-y-auto space-y-5 px-px">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-pet_id">Pet</Label>
                                            <select id="edit-pet_id" name="pet_id" required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" defaultValue={editingRecord.pet.id}>
                                                <option value="">Select pet...</option>
                                                {allPets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.client.name})</option>)}
                                            </select>
                                            {errors.pet_id && <p className="text-sm text-destructive">{errors.pet_id}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-visit_date">Visit Date</Label>
                                            <Input id="edit-visit_date" name="visit_date" type="date" defaultValue={editingRecord.visit_date} required />
                                            {errors.visit_date && <p className="text-sm text-destructive">{errors.visit_date}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-veterinarian_id">Veterinarian</Label>
                                            <select id="edit-veterinarian_id" name="veterinarian_id" required className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" defaultValue={editingRecord.veterinarian.id}>
                                                <option value="">Select vet...</option>
                                                {veterinarians.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                            </select>
                                            {errors.veterinarian_id && <p className="text-sm text-destructive">{errors.veterinarian_id}</p>}
                                        </div>
                                    </div>

                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b pb-1">SOAP Notes</p>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-subjective">Subjective <span className="text-muted-foreground font-normal">(Chief complaint, history)</span></Label>
                                        <textarea id="edit-subjective" name="subjective" rows={3} defaultValue={editingRecord.subjective ?? ''} className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                        {errors.subjective && <p className="text-sm text-destructive">{errors.subjective}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-objective">Objective <span className="text-muted-foreground font-normal">(Examination findings)</span></Label>
                                        <textarea id="edit-objective" name="objective" rows={3} defaultValue={editingRecord.objective ?? ''} className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                        {errors.objective && <p className="text-sm text-destructive">{errors.objective}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-assessment">Assessment <span className="text-muted-foreground font-normal">(Diagnosis)</span></Label>
                                        <textarea id="edit-assessment" name="assessment" rows={3} defaultValue={editingRecord.assessment ?? ''} className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                        {errors.assessment && <p className="text-sm text-destructive">{errors.assessment}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-plan">Plan <span className="text-muted-foreground font-normal">(Treatment plan)</span></Label>
                                        <textarea id="edit-plan" name="plan" rows={3} defaultValue={editingRecord.plan ?? ''} className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                        {errors.plan && <p className="text-sm text-destructive">{errors.plan}</p>}
                                    </div>

                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b pb-1">Vitals</p>

                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-temperature">Temperature</Label>
                                            <Input id="edit-temperature" name="temperature" type="number" step="0.1" placeholder="°C" defaultValue={editingRecord.temperature ?? ''} />
                                            {errors.temperature && <p className="text-sm text-destructive">{errors.temperature}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-heart_rate">Heart Rate</Label>
                                            <Input id="edit-heart_rate" name="heart_rate" type="number" placeholder="bpm" defaultValue={editingRecord.heart_rate ?? ''} />
                                            {errors.heart_rate && <p className="text-sm text-destructive">{errors.heart_rate}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-respiratory_rate">Resp. Rate</Label>
                                            <Input id="edit-respiratory_rate" name="respiratory_rate" type="number" placeholder="/min" defaultValue={editingRecord.respiratory_rate ?? ''} />
                                            {errors.respiratory_rate && <p className="text-sm text-destructive">{errors.respiratory_rate}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-weight">Weight</Label>
                                            <Input id="edit-weight" name="weight" type="number" step="0.01" placeholder="kg" defaultValue={editingRecord.weight ?? ''} />
                                            {errors.weight && <p className="text-sm text-destructive">{errors.weight}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-notes">Additional Notes</Label>
                                        <textarea id="edit-notes" name="notes" rows={3} defaultValue={editingRecord.notes ?? ''} className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
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
                    <CardHeader><CardTitle>All Records</CardTitle></CardHeader>
                    <CardContent>
                        {records.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No medical records found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium">Pet</th>
                                            <th className="pb-3 font-medium">Owner</th>
                                            <th className="pb-3 font-medium">Vet</th>
                                            <th className="pb-3 font-medium">Date</th>
                                            <th className="pb-3 font-medium">Diagnosis</th>
                                            <th className="pb-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {records.data.map((r) => (
                                            <tr key={r.id} className="border-b last:border-0">
                                                <td className="py-3">{r.pet.name}</td>
                                                <td className="py-3 text-muted-foreground">{r.pet.client.name}</td>
                                                <td className="py-3 text-muted-foreground">{r.veterinarian.name}</td>
                                                <td className="py-3">{r.visit_date}</td>
                                                <td className="py-3 text-muted-foreground max-w-xs truncate">{r.assessment ?? '—'}</td>
                                                <td className="py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => setEditingRecord(r)}>
                                                            <Pencil />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete this record?')) router.delete(medicalRecords.destroy.url(r.id)); }}>
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
                        {records.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Showing {records.from} to {records.to} of {records.total}</p>
                                <div className="flex gap-2">
                                    {records.current_page > 1 && <Button variant="outline" size="sm" onClick={() => router.get(medicalRecords.index.url({ query: { page: records.current_page - 1 } }))}>Previous</Button>}
                                    {records.current_page < records.last_page && <Button variant="outline" size="sm" onClick={() => router.get(medicalRecords.index.url({ query: { page: records.current_page + 1 } }))}>Next</Button>}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

MedicalRecordsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Medical Records', href: medicalRecords.index() },
    ],
};
