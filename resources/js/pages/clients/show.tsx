import { Head, Link, router } from '@inertiajs/react';
import { Pencil, PawPrint, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import clients from '@/routes/clients';
import pets from '@/routes/pets';

interface Pet {
    id: number;
    name: string;
    species: string;
    breed: string | null;
    sex: string | null;
    date_of_birth: string | null;
    is_active: boolean;
}

interface ClientShowProps {
    client: {
        id: number;
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        emergency_contact_name: string | null;
        emergency_contact_phone: string | null;
        notes: string | null;
        is_active: boolean;
        pets_count: number;
        pets: Pet[];
        created_at: string;
    };
}

export default function ClientShow({ client }: ClientShowProps) {
    return (
        <>
            <Head title={client.name} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={clients.index()}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-semibold tracking-tight">{client.name}</h1>
                    <Badge variant={client.is_active ? 'default' : 'secondary'}>
                        {client.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="text-sm">{client.email ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="text-sm">{client.phone ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Address</p>
                                <p className="text-sm whitespace-pre-wrap">{client.address ?? '—'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Emergency Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Name</p>
                                <p className="text-sm">{client.emergency_contact_name ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="text-sm">{client.emergency_contact_phone ?? '—'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {client.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Pets ({client.pets_count})</CardTitle>
                        <Link href={pets.index()}>
                            <Button variant="outline" size="sm">
                                <PawPrint /> View All Pets
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {client.pets.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No pets registered for this client.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium">Name</th>
                                            <th className="pb-3 font-medium">Species</th>
                                            <th className="pb-3 font-medium">Breed</th>
                                            <th className="pb-3 font-medium">Sex</th>
                                            <th className="pb-3 font-medium">Status</th>
                                            <th className="pb-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {client.pets.map((pet) => (
                                            <tr key={pet.id} className="border-b last:border-0">
                                                <td className="py-3">
                                                    <Link href={pets.show(pet.id)} className="font-medium hover:underline">
                                                        {pet.name}
                                                    </Link>
                                                </td>
                                                <td className="py-3 text-muted-foreground capitalize">{pet.species}</td>
                                                <td className="py-3 text-muted-foreground">{pet.breed ?? '—'}</td>
                                                <td className="py-3 text-muted-foreground capitalize">{pet.sex ?? '—'}</td>
                                                <td className="py-3">
                                                    <Badge variant={pet.is_active ? 'default' : 'secondary'}>
                                                        {pet.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <Link href={pets.show(pet.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <Pencil />
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ClientShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Clients', href: clients.index() },
    ],
};
