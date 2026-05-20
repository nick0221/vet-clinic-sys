import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { dashboard } from '@/routes';
import labRequests from '@/routes/lab-requests';
import pets from '@/routes/pets';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';

interface LabResult {
    id: number;
    parameter: string;
    value: string;
    reference_range: string | null;
    notes: string | null;
}

interface ShowProps {
    labRequest: {
        id: number;
        request_date: string;
        status: string;
        notes: string | null;
        pet: { id: number; name: string; species: string };
        veterinarian: { id: number; name: string };
        lab_test: { id: number; name: string };
        results: LabResult[];
    };
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100',
    collected: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100',
    in_progress: 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-100',
    completed: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-100',
    cancelled: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-100',
};

export default function LabRequestShow({ labRequest }: ShowProps) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        parameter: '',
        value: '',
        reference_range: '',
        notes: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/lab-requests/${labRequest.id}/results`, {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                reset();
            },
        });
    }

    return (
        <>
            <Head title={`Lab Request - ${labRequest.pet.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={labRequests.index()}><Button variant="ghost" size="icon"><ArrowLeft /></Button></Link>
                    <h1 className="text-xl font-semibold tracking-tight">Lab Request: {labRequest.pet.name}</h1>
                    <Badge variant="outline" className={statusColors[labRequest.status] ?? ''}>
                        {labRequest.status.replace('_', ' ')}
                    </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>Request Details</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Lab Test</p>
                                <p className="text-sm font-medium">{labRequest.lab_test.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Request Date</p>
                                <p className="text-sm">{formatDate(labRequest.request_date)}</p>
                            </div>
                            {labRequest.notes && (
                                <div>
                                    <p className="text-xs text-muted-foreground">Notes</p>
                                    <p className="text-sm whitespace-pre-wrap">{labRequest.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <div className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle>Patient</CardTitle></CardHeader>
                            <CardContent>
                                <Link href={pets.show(labRequest.pet.id)} className="text-sm font-medium hover:underline">{labRequest.pet.name}</Link>
                                <p className="text-xs text-muted-foreground capitalize">{labRequest.pet.species}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Veterinarian</CardTitle></CardHeader>
                            <CardContent><p className="text-sm font-medium">{labRequest.veterinarian.name}</p></CardContent>
                        </Card>
                    </div>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Results</CardTitle>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm"><Plus /> Add Result</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Lab Result</DialogTitle>
                                    <DialogDescription>Enter the result details for {labRequest.pet.name}.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="parameter">Parameter</Label>
                                        <Input id="parameter" value={data.parameter} onChange={e => setData('parameter', e.target.value)} placeholder="e.g. WBC, RBC, Glucose" />
                                        {errors.parameter && <p className="text-sm text-destructive">{errors.parameter}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="value">Value</Label>
                                        <Input id="value" value={data.value} onChange={e => setData('value', e.target.value)} placeholder="Result value" />
                                        {errors.value && <p className="text-sm text-destructive">{errors.value}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reference_range">Reference Range</Label>
                                        <Input id="reference_range" value={data.reference_range} onChange={e => setData('reference_range', e.target.value)} placeholder="e.g. 4.5-11.0" />
                                        {errors.reference_range && <p className="text-sm text-destructive">{errors.reference_range}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea id="notes" value={data.notes} onChange={e => setData('notes', e.target.value)} placeholder="Optional notes" />
                                        {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                        <Button type="submit" disabled={processing}>Save</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {labRequest.results.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No results recorded yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium">Parameter</th>
                                            <th className="pb-3 font-medium">Value</th>
                                            <th className="pb-3 font-medium">Reference Range</th>
                                            <th className="pb-3 font-medium">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {labRequest.results.map((r) => (
                                            <tr key={r.id} className="border-b last:border-0">
                                                <td className="py-3 font-medium">{r.parameter}</td>
                                                <td className="py-3">{r.value}</td>
                                                <td className="py-3 text-muted-foreground">{r.reference_range ?? '—'}</td>
                                                <td className="py-3 text-muted-foreground">{r.notes ?? '—'}</td>
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

LabRequestShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Lab Requests', href: labRequests.index() },
        { title: 'Details', href: '' },
    ],
};
