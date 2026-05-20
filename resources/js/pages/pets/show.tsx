import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import pets from '@/routes/pets';
import clientsRoute from '@/routes/clients';
import { formatDate } from '@/lib/utils';

interface PetShowProps {
    pet: {
        id: number;
        name: string;
        species: string;
        breed: string | null;
        sex: string | null;
        date_of_birth: string | null;
        weight: string | null;
        color: string | null;
        microchip_id: string | null;
        photo: string | null;
        notes: string | null;
        is_active: boolean;
        created_at: string;
        client: {
            id: number;
            name: string;
            email: string | null;
            phone: string | null;
        };
    };
}

export default function PetShow({ pet }: PetShowProps) {
    return (
        <>
            <Head title={pet.name} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={pets.index()}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-semibold tracking-tight">{pet.name}</h1>
                    <Badge variant={pet.is_active ? 'default' : 'secondary'}>
                        {pet.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pet Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Species</p>
                                <p className="text-sm capitalize">{pet.species}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Breed</p>
                                <p className="text-sm">{pet.breed ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Sex</p>
                                <p className="text-sm capitalize">{pet.sex ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Date of Birth</p>
                                <p className="text-sm">{formatDate(pet.date_of_birth)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Weight</p>
                                <p className="text-sm">{pet.weight ? `${pet.weight} kg` : '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Color</p>
                                <p className="text-sm">{pet.color ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Microchip ID</p>
                                <p className="text-sm font-mono">{pet.microchip_id ?? '—'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Owner Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Name</p>
                                <Link
                                    href={clientsRoute.show(pet.client.id)}
                                    className="text-sm font-medium hover:underline"
                                >
                                    {pet.client.name}
                                </Link>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="text-sm">{pet.client.email ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="text-sm">{pet.client.phone ?? '—'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {pet.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{pet.notes}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

PetShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Pets', href: pets.index() },
    ],
};
