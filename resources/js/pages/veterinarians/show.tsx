import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
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

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Veterinarian Details</CardTitle>
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
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm text-muted-foreground">Name</dt>
                                <dd className="text-sm font-medium">{veterinarian.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">Email</dt>
                                <dd className="text-sm font-medium">{veterinarian.email}</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Edit Veterinarian</DialogTitle>
                            <DialogDescription>Update veterinarian information.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit}>
                            <div className="space-y-4">
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
