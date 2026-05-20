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
import { dashboard } from '@/routes';
import veterinarians from '@/routes/veterinarians';

interface VeterinarianData {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    specialization: string | null;
    license_number: string | null;
    bio: string | null;
    address: string | null;
    emergency_contact: string | null;
    start_date: string | null;
    notes: string | null;
}

interface PaginatedData {
    data: VeterinarianData[];
    current_page: number; last_page: number; per_page: number; total: number; from: number; to: number;
}

interface Props {
    veterinarians: PaginatedData;
    filters: { search?: string };
}

function ProfileFields({ prefix, data }: { prefix: string; data?: VeterinarianData }) {
    const { errors } = usePage().props;
    const id = (name: string) => `${prefix}-${name}`;

    return (
        <div className="max-h-[65vh] overflow-y-auto space-y-4 px-px">
            <div className="grid gap-2">
                <Label htmlFor={id('name')}>Name</Label>
                <Input id={id('name')} name="name" defaultValue={data?.name} required />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="grid gap-2">
                <Label htmlFor={id('email')}>Email</Label>
                <Input id={id('email')} name="email" type="email" defaultValue={data?.email} required />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="grid gap-2">
                <Label htmlFor={id('phone')}>Phone</Label>
                <Input id={id('phone')} name="phone" defaultValue={data?.phone ?? ''} />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
            <div className="grid gap-2">
                <Label htmlFor={id('specialization')}>Specialization</Label>
                <Input id={id('specialization')} name="specialization" defaultValue={data?.specialization ?? ''} placeholder="e.g. Small Animal, Surgery, Dentistry" />
                {errors.specialization && <p className="text-sm text-destructive">{errors.specialization}</p>}
            </div>
            <div className="grid gap-2">
                <Label htmlFor={id('license_number')}>License Number</Label>
                <Input id={id('license_number')} name="license_number" defaultValue={data?.license_number ?? ''} />
                {errors.license_number && <p className="text-sm text-destructive">{errors.license_number}</p>}
            </div>
            <div className="grid gap-2">
                <Label htmlFor={id('start_date')}>Start Date</Label>
                <Input id={id('start_date')} name="start_date" type="date" defaultValue={data?.start_date ?? ''} />
                {errors.start_date && <p className="text-sm text-destructive">{errors.start_date}</p>}
            </div>
            <div className="grid gap-2">
                <Label htmlFor={id('emergency_contact')}>Emergency Contact</Label>
                <Input id={id('emergency_contact')} name="emergency_contact" defaultValue={data?.emergency_contact ?? ''} />
                {errors.emergency_contact && <p className="text-sm text-destructive">{errors.emergency_contact}</p>}
            </div>
            <div className="grid gap-2">
                <Label htmlFor={id('address')}>Address</Label>
                <textarea id={id('address')} name="address" defaultValue={data?.address ?? ''} className="border-input flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
            </div>
            <div className="grid gap-2">
                <Label htmlFor={id('bio')}>Bio</Label>
                <textarea id={id('bio')} name="bio" defaultValue={data?.bio ?? ''} className="border-input flex h-24 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                {errors.bio && <p className="text-sm text-destructive">{errors.bio}</p>}
            </div>
            <div className="grid gap-2">
                <Label htmlFor={id('notes')}>Notes</Label>
                <textarea id={id('notes')} name="notes" defaultValue={data?.notes ?? ''} className="border-input flex h-24 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
            </div>
            {!data && (
                <div className="grid gap-2">
                    <Label htmlFor={id('password')}>Password</Label>
                    <Input id={id('password')} name="password" type="password" required />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
            )}
            {data && (
                <div className="grid gap-2">
                    <Label htmlFor={id('password')}>New Password</Label>
                    <Input id={id('password')} name="password" type="password" placeholder="Leave blank to keep current" />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
            )}
        </div>
    );
}

export default function VeterinariansIndex({ veterinarians: data, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [createOpen, setCreateOpen] = useState(false);
    const [editingVet, setEditingVet] = useState<VeterinarianData | null>(null);
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
        router.post(veterinarians.store.url(), values, {
            onSuccess: () => setCreateOpen(false),
            onError: () => {},
        });
    }

    function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingVet) return;
        const values = formToJson(e.currentTarget);
        if (!values.password) {
            delete values.password;
        }
        router.put(veterinarians.update.url(editingVet.id), values, {
            onSuccess: () => setEditingVet(null),
            onError: () => {},
        });
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(veterinarians.index.url(), { search: search || undefined }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    function clearFilters() {
        setSearch('');
        router.get(veterinarians.index.url());
    }

    const hasFilters = search;

    return (
        <>
            <Head title="Veterinarians" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold tracking-tight">Veterinarians</h1>
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus /> Add Veterinarian</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Add Veterinarian</DialogTitle>
                                <DialogDescription>Create a new veterinarian account.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateSubmit}>
                                <ProfileFields prefix="create" />
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
                            placeholder="Search by name, email, phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            <X className="h-4 w-4 mr-1" /> Clear
                        </Button>
                    )}
                </div>

                {/* Edit Veterinarian Dialog */}
                <Dialog open={editingVet !== null} onOpenChange={(open) => { if (!open) setEditingVet(null); }}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Edit Veterinarian</DialogTitle>
                            <DialogDescription>Update veterinarian information.</DialogDescription>
                        </DialogHeader>
                        {editingVet && (
                            <form onSubmit={handleEditSubmit} key={editingVet.id}>
                                <ProfileFields prefix="edit" data={editingVet} />
                                <DialogFooter className="mt-4">
                                    <Button type="submit">Save</Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>

                <Card>
                    <CardHeader>
                        <CardTitle>All Veterinarians</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No veterinarians found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium">Name</th>
                                            <th className="pb-3 font-medium">Email</th>
                                            <th className="pb-3 font-medium">Phone</th>
                                            <th className="pb-3 font-medium">Specialization</th>
                                            <th className="pb-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.data.map((item) => (
                                            <tr key={item.id} className="border-b last:border-0">
                                                <td className="py-3 font-medium">
                                                    <Link href={veterinarians.show(item.id)} className="hover:underline">{item.name}</Link>
                                                </td>
                                                <td className="py-3">{item.email}</td>
                                                <td className="py-3">{item.phone ?? '—'}</td>
                                                <td className="py-3">{item.specialization ?? '—'}</td>
                                                <td className="py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={veterinarians.show(item.id)}>
                                                            <Button variant="ghost" size="sm">View</Button>
                                                        </Link>
                                                        <Button variant="ghost" size="sm" onClick={() => setEditingVet(item)}>
                                                            <Pencil />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => { if (confirm('Remove this veterinarian?')) router.delete(veterinarians.destroy.url(item.id)); }}>
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
                                    {data.current_page > 1 && <Button variant="outline" size="sm" onClick={() => router.get(veterinarians.index.url({ query: { page: data.current_page - 1, search: search || undefined } }))}>Previous</Button>}
                                    {data.current_page < data.last_page && <Button variant="outline" size="sm" onClick={() => router.get(veterinarians.index.url({ query: { page: data.current_page + 1, search: search || undefined } }))}>Next</Button>}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

VeterinariansIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Veterinarians', href: veterinarians.index() },
    ],
};
