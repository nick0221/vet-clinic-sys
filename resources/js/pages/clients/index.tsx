import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
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
import clients from '@/routes/clients';

interface Client {
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
    created_at: string;
}

interface PaginatedData {
    data: Client[];
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

export default function ClientsIndex({ clients: clientsData, filters }: { clients: PaginatedData; filters?: Filters }) {
    const [searchValue, setSearchValue] = React.useState(filters?.search ?? '');

    function handleSearch() {
        router.get(clients.index.url({ query: { search: searchValue || null, page: null } }));
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') handleSearch();
    }

    function clearSearch() {
        setSearchValue('');
        router.get(clients.index.url({ query: { search: null, page: null } }));
    }

    const [createOpen, setCreateOpen] = React.useState(false);
    const [editingClient, setEditingClient] = React.useState<Client | null>(null);
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
        router.post(clients.store.url(), values, {
            onSuccess: () => setCreateOpen(false),
            onError: () => {},
        });
    }

    function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingClient) return;
        const values = formToJson(e.currentTarget);
        router.put(clients.update.url(editingClient.id), values, {
            onSuccess: () => setEditingClient(null),
            onError: () => {},
        });
    }

    return (
        <>
            <Head title="Clients" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold tracking-tight">Clients</h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Search clients..."
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
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus /> Add Client
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Add Client</DialogTitle>
                                    <DialogDescription>Add a new pet owner to the system.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateSubmit}>
                                    <div className="max-h-[65vh] overflow-y-auto space-y-4 px-px">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input id="name" name="name" required />
                                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" name="email" type="email" />
                                            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input id="phone" name="phone" />
                                            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="address">Address</Label>
                                            <textarea
                                                id="address"
                                                name="address"
                                                className="border-input placeholder:text-muted-foreground flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                            />
                                            {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                                        </div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Emergency Contact</p>
                                        <div className="grid gap-2">
                                            <Label htmlFor="emergency_contact_name">Name</Label>
                                            <Input id="emergency_contact_name" name="emergency_contact_name" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="emergency_contact_phone">Phone</Label>
                                            <Input id="emergency_contact_phone" name="emergency_contact_phone" />
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

                {/* Edit Client Dialog */}
                <Dialog open={editingClient !== null} onOpenChange={(open) => { if (!open) setEditingClient(null); }}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Edit Client</DialogTitle>
                            <DialogDescription>Update pet owner information.</DialogDescription>
                        </DialogHeader>
                        {editingClient && (
                            <form onSubmit={handleEditSubmit} key={editingClient.id}>
                                <div className="max-h-[65vh] overflow-y-auto space-y-4 px-px">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-name">Name</Label>
                                        <Input id="edit-name" name="name" defaultValue={editingClient.name} required />
                                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-email">Email</Label>
                                        <Input id="edit-email" name="email" type="email" defaultValue={editingClient.email ?? ''} />
                                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-phone">Phone</Label>
                                        <Input id="edit-phone" name="phone" defaultValue={editingClient.phone ?? ''} />
                                        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-address">Address</Label>
                                        <textarea
                                            id="edit-address"
                                            name="address"
                                            defaultValue={editingClient.address ?? ''}
                                            className="border-input placeholder:text-muted-foreground flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                        />
                                        {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                                    </div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Emergency Contact</p>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-emergency_contact_name">Name</Label>
                                        <Input id="edit-emergency_contact_name" name="emergency_contact_name" defaultValue={editingClient.emergency_contact_name ?? ''} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-emergency_contact_phone">Phone</Label>
                                        <Input id="edit-emergency_contact_phone" name="emergency_contact_phone" defaultValue={editingClient.emergency_contact_phone ?? ''} />
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
                        <CardTitle>All Clients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {clientsData.data.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No clients found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium">Name</th>
                                            <th className="pb-3 font-medium">Email</th>
                                            <th className="pb-3 font-medium">Phone</th>
                                            <th className="pb-3 font-medium">Pets</th>
                                            <th className="pb-3 font-medium">Status</th>
                                            <th className="pb-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientsData.data.map((client) => (
                                            <tr key={client.id} className="border-b last:border-0">
                                                <td className="py-3">
                                                    <Link
                                                        href={clients.show(client.id)}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {client.name}
                                                    </Link>
                                                </td>
                                                <td className="py-3 text-muted-foreground">{client.email ?? '—'}</td>
                                                <td className="py-3 text-muted-foreground">{client.phone ?? '—'}</td>
                                                <td className="py-3">{client.pets_count}</td>
                                                <td className="py-3">
                                                    <Badge variant={client.is_active ? 'default' : 'secondary'}>
                                                        {client.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => setEditingClient(client)}>
                                                            <Pencil />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                if (confirm('Delete this client? This will also delete all associated pets.')) {
                                                                    router.delete(clients.destroy.url(client.id));
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

                        {clientsData.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {clientsData.from} to {clientsData.to} of {clientsData.total}
                                </p>
                                <div className="flex gap-2">
                                    {clientsData.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(clients.index.url({ query: { page: clientsData.current_page - 1, search: searchValue || undefined } }))
                                            }
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {clientsData.current_page < clientsData.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(clients.index.url({ query: { page: clientsData.current_page + 1, search: searchValue || undefined } }))
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

ClientsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Clients', href: clients.index() },
    ],
};
