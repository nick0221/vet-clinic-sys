import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, LoaderCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import surgeries from '@/routes/surgeries';
import pets from '@/routes/pets';
import { formatDate } from '@/lib/utils';

interface SurgeryProcedure {
    id: number;
    procedure_name: string;
    description: string | null;
    notes: string | null;
}

interface ShowProps {
    surgery: {
        id: number;
        surgery_name: string;
        description: string | null;
        scheduled_date: string;
        start_time: string | null;
        end_time: string | null;
        status: string;
        notes: string | null;
        pet: { id: number; name: string; species: string };
        veterinarian: { id: number; name: string };
        procedures: SurgeryProcedure[];
    };
}

const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100',
    in_progress: 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-100',
    completed: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-100',
    cancelled: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-100',
};

export default function SurgeryShow({ surgery }: ShowProps) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        procedure_name: '',
        description: '',
        notes: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/surgeries/${surgery.id}/procedures`, {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    }

    return (
        <>
            <Head title={`Surgery - ${surgery.surgery_name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={surgeries.index()}><Button variant="ghost" size="icon"><ArrowLeft /></Button></Link>
                    <h1 className="text-xl font-semibold tracking-tight">Surgery: {surgery.surgery_name}</h1>
                    <Badge variant="outline" className={statusColors[surgery.status] ?? ''}>
                        {surgery.status.replace('_', ' ')}
                    </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>Surgery Details</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {surgery.description && (
                                <div>
                                    <p className="text-xs text-muted-foreground">Description</p>
                                    <p className="text-sm whitespace-pre-wrap">{surgery.description}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-muted-foreground">Scheduled Date</p>
                                <p className="text-sm">{formatDate(surgery.scheduled_date)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Start Time</p>
                                    <p className="text-sm">{surgery.start_time ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">End Time</p>
                                    <p className="text-sm">{surgery.end_time ?? '—'}</p>
                                </div>
                            </div>
                            {surgery.notes && (
                                <div>
                                    <p className="text-xs text-muted-foreground">Notes</p>
                                    <p className="text-sm whitespace-pre-wrap">{surgery.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <div className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle>Patient</CardTitle></CardHeader>
                            <CardContent>
                                <Link href={pets.show(surgery.pet.id)} className="text-sm font-medium hover:underline">{surgery.pet.name}</Link>
                                <p className="text-xs text-muted-foreground capitalize">{surgery.pet.species}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Veterinarian</CardTitle></CardHeader>
                            <CardContent><p className="text-sm font-medium">{surgery.veterinarian.name}</p></CardContent>
                        </Card>
                    </div>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Procedures</CardTitle>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm"><Plus /> Add Procedure</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Add Procedure</DialogTitle>
                                    <DialogDescription>Record a new procedure for this surgery.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="procedure_name">Procedure Name</Label>
                                            <Input id="procedure_name" value={data.procedure_name} onChange={(e) => setData('procedure_name', e.target.value)} required />
                                            {errors.procedure_name && <p className="text-sm text-destructive">{errors.procedure_name}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="description">Description</Label>
                                            <textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} className="border-input flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="notes">Notes</Label>
                                            <textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} className="border-input flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                            {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                                        </div>
                                    </div>
                                    <DialogFooter className="mt-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                            Save
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {surgery.procedures.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No procedures recorded.</p>
                        ) : (
                            <div className="space-y-3">
                                {surgery.procedures.map((proc) => (
                                    <div key={proc.id} className="rounded-lg border p-3">
                                        <h3 className="text-sm font-medium">{proc.procedure_name}</h3>
                                        {proc.description && <p className="mt-1 text-xs text-muted-foreground">{proc.description}</p>}
                                        {proc.notes && <p className="mt-1 text-xs text-muted-foreground">{proc.notes}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

SurgeryShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Surgeries', href: surgeries.index() },
        { title: 'Details', href: '' },
    ],
};
