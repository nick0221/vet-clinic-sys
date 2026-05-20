import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/date-picker';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes';
import clientsRoute from '@/routes/clients';
import pets from '@/routes/pets';

interface Client {
    id: number;
    name: string;
}

interface Pet {
    id: number;
    name: string;
    species: string;
    breed: string | null;
    sex: string | null;
    date_of_birth: string | null;
    weight: string | null;
    color: string | null;
    microchip_id: string | null;
    is_active: boolean;
    notes: string | null;
    client: Client;
}

interface PaginatedData {
    data: Pet[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Filters {
    search?: string;
}

interface PetsIndexProps {
    pets: PaginatedData;
    clients: Client[];
    filters?: Filters;
}

export default function PetsIndex({ pets: petsData, clients, filters }: PetsIndexProps) {
    const [searchValue, setSearchValue] = React.useState(filters?.search ?? '');
    const [createOpen, setCreateOpen] = React.useState(false);
    const [editingPet, setEditingPet] = React.useState<Pet | null>(null);
    const [createSpecies, setCreateSpecies] = React.useState('');
    const [editSpecies, setEditSpecies] = React.useState('');
    const [createCustomSpecies, setCreateCustomSpecies] = React.useState(false);
    const [createCustomSpeciesInput, setCreateCustomSpeciesInput] = React.useState('');
    const [editCustomSpecies, setEditCustomSpecies] = React.useState(false);
    const [editCustomSpeciesInput, setEditCustomSpeciesInput] = React.useState('');
    const [createDob, setCreateDob] = React.useState<Date | undefined>();
    const [editDob, setEditDob] = React.useState<Date | undefined>();
    const { errors } = usePage().props;

    const commonSpecies = [
        'Dog', 'Cat',
    ];

    React.useEffect(() => {
        if (editingPet) {
            const species = editingPet.species;
            const isCommon = commonSpecies.map(s => s.toLowerCase()).includes(species.toLowerCase());
            setEditSpecies(species);
            setEditCustomSpecies(!isCommon);
            setEditCustomSpeciesInput(!isCommon ? species : '');
            setEditDob(editingPet.date_of_birth ? new Date(editingPet.date_of_birth) : undefined);
        }
    }, [editingPet]);

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
        router.post(pets.store.url(), values, {
            onSuccess: () => {
                setCreateOpen(false);
                setCreateSpecies('');
                setCreateCustomSpecies(false);
                setCreateCustomSpeciesInput('');
                setCreateDob(undefined);
            },
            onError: () => {},
        });
    }

    function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingPet) return;
        const values = formToJson(e.currentTarget);
        router.put(pets.update.url(editingPet.id), values, {
            onSuccess: () => setEditingPet(null),
            onError: () => {},
        });
    }

    function handleSearch() {
        router.get(pets.index.url({ query: { search: searchValue || null, page: null } }));
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') handleSearch();
    }

    function clearSearch() {
        setSearchValue('');
        router.get(pets.index.url({ query: { search: null, page: null } }));
    }

    return (
        <>
            <Head title="Pets" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold tracking-tight">Pets</h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Search pets..."
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
                        <Dialog open={createOpen} onOpenChange={(open) => {
                            setCreateOpen(open);
                            if (open) {
                                setCreateSpecies('');
                                setCreateCustomSpecies(false);
                                setCreateCustomSpeciesInput('');
                                setCreateDob(undefined);
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus /> Add Pet
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>Add Pet</DialogTitle>
                                    <DialogDescription>Register a new pet patient.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateSubmit}>
                                    <div className="max-h-[65vh] overflow-y-auto space-y-4 px-px">
                                        <div className="grid gap-2">
                                            <Label htmlFor="client_id">Owner</Label>
                                            <select
                                                id="client_id"
                                                name="client_id"
                                                className="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                                required
                                            >
                                                <option value="">Select owner...</option>
                                                {clients.map((client) => (
                                                    <option key={client.id} value={client.id}>
                                                        {client.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.client_id && <p className="text-sm text-destructive">{errors.client_id}</p>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">Name</Label>
                                                <Input id="name" name="name" required />
                                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="species">Species</Label>
                                                <input type="hidden" name="species" value={createCustomSpecies ? createCustomSpeciesInput : createSpecies} />
                                                <Select
                                                    value={createCustomSpecies ? 'other' : createSpecies}
                                                    onValueChange={(val) => {
                                                        if (val === 'other') {
                                                            setCreateCustomSpecies(true);
                                                            setCreateSpecies('other');
                                                        } else {
                                                            setCreateCustomSpecies(false);
                                                            setCreateSpecies(val);
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select species..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {commonSpecies.map((s) => (
                                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                                        ))}
                                                        <SelectItem value="other">Other...</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {createCustomSpecies && (
                                                    <Input
                                                        placeholder="Type species name..."
                                                        value={createCustomSpeciesInput}
                                                        onChange={(e) => setCreateCustomSpeciesInput(e.target.value)}
                                                        className="mt-1"
                                                        autoFocus
                                                    />
                                                )}
                                                {errors.species && <p className="text-sm text-destructive">{errors.species}</p>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="breed">Breed</Label>
                                                <Input id="breed" name="breed" />
                                                {errors.breed && <p className="text-sm text-destructive">{errors.breed}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="sex">Sex</Label>
                                                <select
                                                    id="sex"
                                                    name="sex"
                                                    className="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                                >
                                                    <option value="">Select...</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                </select>
                                                {errors.sex && <p className="text-sm text-destructive">{errors.sex}</p>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="grid gap-2">
                                                <Label>Date of Birth</Label>
                                                <DatePicker
                                                    value={createDob}
                                                    onChange={(date) => setCreateDob(date)}
                                                    name="date_of_birth"
                                                    id="date_of_birth"
                                                />
                                                {errors.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="weight">Weight (kg)</Label>
                                                <Input id="weight" name="weight" type="number" step="0.01" />
                                                {errors.weight && <p className="text-sm text-destructive">{errors.weight}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="color">Color</Label>
                                                <Input id="color" name="color" />
                                                {errors.color && <p className="text-sm text-destructive">{errors.color}</p>}
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                                <Label htmlFor="microchip_id">Microchip ID</Label>
                                                <Input id="microchip_id" name="microchip_id" />
                                                {errors.microchip_id && <p className="text-sm text-destructive">{errors.microchip_id}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="notes">Notes</Label>
                                            <textarea
                                                id="notes"
                                                name="notes"
                                                className="border-input placeholder:text-muted-foreground flex h-20 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                            />
                                            {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                                        </div>
                                    </div>
                                    <DialogFooter className="mt-4">
                                        <Button type="submit">
                                            Save
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Edit Pet Dialog */}
                <Dialog open={editingPet !== null} onOpenChange={(open) => { if (!open) setEditingPet(null); }}>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Edit Pet</DialogTitle>
                            <DialogDescription>Update pet patient information.</DialogDescription>
                        </DialogHeader>
                        {editingPet && (
                            <form onSubmit={handleEditSubmit} key={editingPet.id}>
                                <div className="max-h-[65vh] overflow-y-auto space-y-4 px-px">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-client_id">Owner</Label>
                                            <select
                                                id="edit-client_id"
                                                name="client_id"
                                                className="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                                required
                                                defaultValue={editingPet.client.id}
                                            >
                                                <option value="">Select owner...</option>
                                                {clients.map((client) => (
                                                    <option key={client.id} value={client.id}>
                                                        {client.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.client_id && <p className="text-sm text-destructive">{errors.client_id}</p>}
                                        </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-name">Name</Label>
                                            <Input id="edit-name" name="name" defaultValue={editingPet.name} required />
                                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-species">Species</Label>
                                            <input type="hidden" name="species" value={editCustomSpecies ? editCustomSpeciesInput : editSpecies} />
                                            <Select
                                                value={editCustomSpecies ? 'other' : editSpecies}
                                                onValueChange={(val) => {
                                                    if (val === 'other') {
                                                        setEditCustomSpecies(true);
                                                        setEditSpecies('other');
                                                    } else {
                                                        setEditCustomSpecies(false);
                                                        setEditSpecies(val);
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select species..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {commonSpecies.map((s) => (
                                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                                    ))}
                                                    <SelectItem value="other">Other...</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {editCustomSpecies && (
                                                <Input
                                                    placeholder="Type species name..."
                                                    value={editCustomSpeciesInput}
                                                    onChange={(e) => setEditCustomSpeciesInput(e.target.value)}
                                                    className="mt-1"
                                                    autoFocus
                                                />
                                            )}
                                            {errors.species && <p className="text-sm text-destructive">{errors.species}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-breed">Breed</Label>
                                            <Input id="edit-breed" name="breed" defaultValue={editingPet.breed ?? ''} />
                                            {errors.breed && <p className="text-sm text-destructive">{errors.breed}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-sex">Sex</Label>
                                            <select
                                                id="edit-sex"
                                                name="sex"
                                                defaultValue={editingPet.sex ?? ''}
                                                className="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                            >
                                                <option value="">Select...</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                            {errors.sex && <p className="text-sm text-destructive">{errors.sex}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Date of Birth</Label>
                                            <DatePicker
                                                value={editDob}
                                                onChange={(date) => setEditDob(date)}
                                                name="date_of_birth"
                                                id="edit-date_of_birth"
                                            />
                                            {errors.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-weight">Weight (kg)</Label>
                                            <Input id="edit-weight" name="weight" type="number" step="0.01" defaultValue={editingPet.weight ?? ''} />
                                            {errors.weight && <p className="text-sm text-destructive">{errors.weight}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-color">Color</Label>
                                            <Input id="edit-color" name="color" defaultValue={editingPet.color ?? ''} />
                                            {errors.color && <p className="text-sm text-destructive">{errors.color}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-microchip_id">Microchip ID</Label>
                                        <Input id="edit-microchip_id" name="microchip_id" defaultValue={editingPet.microchip_id ?? ''} />
                                        {errors.microchip_id && <p className="text-sm text-destructive">{errors.microchip_id}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-notes">Notes</Label>
                                        <textarea
                                            id="edit-notes"
                                            name="notes"
                                            defaultValue={editingPet.notes ?? ''}
                                            className="border-input placeholder:text-muted-foreground flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                        />
                                        {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                                    </div>
                                </div>
                                <DialogFooter className="mt-4">
                                    <Button type="submit">
                                        Save
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>

                <Card>
                    <CardHeader>
                        <CardTitle>All Pets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {petsData.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No pets registered.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium">Name</th>
                                            <th className="pb-3 font-medium">Species</th>
                                            <th className="pb-3 font-medium">Breed</th>
                                            <th className="pb-3 font-medium">Owner</th>
                                            <th className="pb-3 font-medium">Status</th>
                                            <th className="pb-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {petsData.data.map((pet) => (
                                            <tr key={pet.id} className="border-b last:border-0">
                                                <td className="py-3">
                                                    <Link
                                                        href={pets.show(pet.id)}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {pet.name}
                                                    </Link>
                                                </td>
                                                <td className="py-3 text-muted-foreground capitalize">{pet.species}</td>
                                                <td className="py-3 text-muted-foreground">{pet.breed ?? '—'}</td>
                                                <td className="py-3">
                                                    <Link
                                                        href={clientsRoute.show(pet.client.id)}
                                                        className="hover:underline"
                                                    >
                                                        {pet.client.name}
                                                    </Link>
                                                </td>
                                                <td className="py-3">
                                                    <Badge variant={pet.is_active ? 'default' : 'secondary'}>
                                                        {pet.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => setEditingPet(pet)}>
                                                            <Pencil />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                if (confirm('Delete this pet?')) {
                                                                    router.delete(pets.destroy.url(pet.id));
                                                                }
                                                            }}
                                                        >
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

                        {petsData.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {petsData.from} to {petsData.to} of {petsData.total}
                                </p>
                                <div className="flex gap-2">
                                    {petsData.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(pets.index.url({ query: { page: petsData.current_page - 1, search: searchValue || undefined } }))
                                            }
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {petsData.current_page < petsData.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(pets.index.url({ query: { page: petsData.current_page + 1, search: searchValue || undefined } }))
                                            }
                                        >
                                            Next
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

PetsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Pets', href: pets.index() },
    ],
};
