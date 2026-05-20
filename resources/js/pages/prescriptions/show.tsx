import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import prescriptions from '@/routes/prescriptions';

interface ShowProps {
    prescription: {
        id: number;
        medication_name: string;
        dosage: string;
        frequency: string;
        route: string | null;
        duration: string | null;
        quantity: number | null;
        refills: number | null;
        notes: string | null;
        start_date: string | null;
        end_date: string | null;
        pet: { id: number; name: string; species: string };
        veterinarian: { id: number; name: string };
    };
}

export default function PrescriptionShow({ prescription }: ShowProps) {
    return (
        <>
            <Head title={prescription.medication_name} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={prescriptions.index()}><Button variant="ghost" size="icon"><ArrowLeft /></Button></Link>
                    <h1 className="text-xl font-semibold tracking-tight">{prescription.medication_name}</h1>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>Prescription Details</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div><p className="text-xs text-muted-foreground">Medication</p><p className="text-sm font-medium">{prescription.medication_name}</p></div>
                            <div><p className="text-xs text-muted-foreground">Dosage</p><p className="text-sm">{prescription.dosage}</p></div>
                            <div><p className="text-xs text-muted-foreground">Frequency</p><p className="text-sm">{prescription.frequency}</p></div>
                            <div><p className="text-xs text-muted-foreground">Route</p><p className="text-sm">{prescription.route ?? '—'}</p></div>
                            <div><p className="text-xs text-muted-foreground">Duration</p><p className="text-sm">{prescription.duration ?? '—'}</p></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-xs text-muted-foreground">Quantity</p><p className="text-sm">{prescription.quantity ?? '—'}</p></div>
                                <div><p className="text-xs text-muted-foreground">Refills</p><p className="text-sm">{prescription.refills ?? '0'}</p></div>
                            </div>
                            {prescription.start_date && <div><p className="text-xs text-muted-foreground">Start Date</p><p className="text-sm">{prescription.start_date}</p></div>}
                            {prescription.end_date && <div><p className="text-xs text-muted-foreground">End Date</p><p className="text-sm">{prescription.end_date}</p></div>}
                            {prescription.notes && <div><p className="text-xs text-muted-foreground">Notes</p><p className="text-sm whitespace-pre-wrap">{prescription.notes}</p></div>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Patient & Prescriber</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div><p className="text-xs text-muted-foreground">Pet</p><p className="text-sm font-medium">{prescription.pet.name} <span className="text-muted-foreground capitalize">({prescription.pet.species})</span></p></div>
                            <div><p className="text-xs text-muted-foreground">Prescribed By</p><p className="text-sm">{prescription.veterinarian.name}</p></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

PrescriptionShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Prescriptions', href: prescriptions.index() },
        { title: 'Details', href: '' },
    ],
};
