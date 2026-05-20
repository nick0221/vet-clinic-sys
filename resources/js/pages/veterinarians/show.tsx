import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
    appointments_count?: number;
    medical_records_count?: number;
    vaccinations_count?: number;
    prescriptions_count?: number;
    surgeries_count?: number;
    lab_requests_count?: number;
}

interface Props {
    veterinarian: VeterinarianData;
}

export default function VeterinariansShow({ veterinarian }: Props) {
    const [editOpen, setEditOpen] = useState(false);
    const { errors } = usePage().props;

    function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const values: Record<string, unknown> = {};
        for (const [key, value] of data) {
            if (key === 'password' && !value) continue;
            values[key] = value === '' ? null : value;
        }
        router.put(veterinarians.update.url(veterinarian.id), values, {
            onSuccess: () => setEditOpen(false),
            onError: () => {},
        });
    }

    return (
        <>
            <Head title={`${veterinarian.name} - Veterinarian`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={veterinarians.index()}>
                        <Button variant="ghost" size="sm"><ArrowLeft /></Button>
                    </Link>
                    <h1 className="text-xl font-semibold tracking-tight">{veterinarian.name}</h1>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Profile Details</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                                    <Pencil /> Edit
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => { if (confirm('Remove this veterinarian?')) router.delete(veterinarians.destroy.url(veterinarian.id)); }}>
                                    <Trash2 className="text-destructive" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm text-muted-foreground">Name</dt>
                                    <dd className="text-sm font-medium">{veterinarian.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">Email</dt>
                                    <dd className="text-sm font-medium">{veterinarian.email}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">Phone</dt>
                                    <dd className="text-sm font-medium">{veterinarian.phone ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">Specialization</dt>
                                    <dd className="text-sm font-medium">{veterinarian.specialization ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">License Number</dt>
                                    <dd className="text-sm font-medium">{veterinarian.license_number ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">Start Date</dt>
                                    <dd className="text-sm font-medium">
                                        {veterinarian.start_date ? format(new Date(veterinarian.start_date), 'MMM d, yyyy') : '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">Emergency Contact</dt>
                                    <dd className="text-sm font-medium">{veterinarian.emergency_contact ?? '—'}</dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-sm text-muted-foreground">Address</dt>
                                    <dd className="text-sm font-medium whitespace-pre-wrap">{veterinarian.address ?? '—'}</dd>
                                </div>
                                {veterinarian.bio && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm text-muted-foreground">Bio</dt>
                                        <dd className="text-sm whitespace-pre-wrap">{veterinarian.bio}</dd>
                                    </div>
                                )}
                                {veterinarian.notes && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm text-muted-foreground">Notes</dt>
                                        <dd className="text-sm whitespace-pre-wrap">{veterinarian.notes}</dd>
                                    </div>
                                )}
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-muted-foreground">Appointments</dt>
                                    <dd className="text-sm font-medium tabular-nums">{veterinarian.appointments_count ?? 0}</dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-muted-foreground">Medical Records</dt>
                                    <dd className="text-sm font-medium tabular-nums">{veterinarian.medical_records_count ?? 0}</dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-muted-foreground">Vaccinations</dt>
                                    <dd className="text-sm font-medium tabular-nums">{veterinarian.vaccinations_count ?? 0}</dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-muted-foreground">Prescriptions</dt>
                                    <dd className="text-sm font-medium tabular-nums">{veterinarian.prescriptions_count ?? 0}</dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-muted-foreground">Surgeries</dt>
                                    <dd className="text-sm font-medium tabular-nums">{veterinarian.surgeries_count ?? 0}</dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-muted-foreground">Lab Requests</dt>
                                    <dd className="text-sm font-medium tabular-nums">{veterinarian.lab_requests_count ?? 0}</dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                </div>

                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Edit Veterinarian</DialogTitle>
                            <DialogDescription>Update veterinarian information.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit}>
                            <div className="max-h-[65vh] overflow-y-auto space-y-4 px-px">
                                <div className="grid gap-2">
                                    <Label htmlFor="show-edit-name">Name</Label>
                                    <Input id="show-edit-name" name="name" defaultValue={veterinarian.name} required />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="show-edit-email">Email</Label>
                                    <Input id="show-edit-email" name="email" type="email" defaultValue={veterinarian.email} required />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="show-edit-phone">Phone</Label>
                                    <Input id="show-edit-phone" name="phone" defaultValue={veterinarian.phone ?? ''} />
                                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="show-edit-specialization">Specialization</Label>
                                    <Input id="show-edit-specialization" name="specialization" defaultValue={veterinarian.specialization ?? ''} />
                                    {errors.specialization && <p className="text-sm text-destructive">{errors.specialization}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="show-edit-license_number">License Number</Label>
                                    <Input id="show-edit-license_number" name="license_number" defaultValue={veterinarian.license_number ?? ''} />
                                    {errors.license_number && <p className="text-sm text-destructive">{errors.license_number}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="show-edit-start_date">Start Date</Label>
                                    <Input id="show-edit-start_date" name="start_date" type="date" defaultValue={veterinarian.start_date ?? ''} />
                                    {errors.start_date && <p className="text-sm text-destructive">{errors.start_date}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="show-edit-emergency_contact">Emergency Contact</Label>
                                    <Input id="show-edit-emergency_contact" name="emergency_contact" defaultValue={veterinarian.emergency_contact ?? ''} />
                                    {errors.emergency_contact && <p className="text-sm text-destructive">{errors.emergency_contact}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="show-edit-address">Address</Label>
                                    <textarea id="show-edit-address" name="address" defaultValue={veterinarian.address ?? ''} className="border-input flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                    {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="show-edit-bio">Bio</Label>
                                    <textarea id="show-edit-bio" name="bio" defaultValue={veterinarian.bio ?? ''} className="border-input flex h-24 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                    {errors.bio && <p className="text-sm text-destructive">{errors.bio}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="show-edit-notes">Notes</Label>
                                    <textarea id="show-edit-notes" name="notes" defaultValue={veterinarian.notes ?? ''} className="border-input flex h-24 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                    {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="show-edit-password">New Password</Label>
                                    <Input id="show-edit-password" name="password" type="password" placeholder="Leave blank to keep current" />
                                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                </div>
                            </div>
                            <DialogFooter className="mt-4">
                                <Button type="submit">Save</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

VeterinariansShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Veterinarians', href: veterinarians.index() },
        { title: (ctx: { veterinarian: VeterinarianData }) => ctx.veterinarian.name, href: '' },
    ],
};
