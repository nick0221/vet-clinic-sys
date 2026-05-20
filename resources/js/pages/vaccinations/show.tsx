import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import vaccinations from '@/routes/vaccinations';
import { formatDate } from '@/lib/utils';

interface ShowProps {
    vaccination: {
        id: number;
        vaccine_name: string;
        manufacturer: string | null;
        batch_number: string | null;
        date_administered: string;
        next_due_date: string | null;
        notes: string | null;
        pet: { id: number; name: string; species: string };
        veterinarian: { id: number; name: string };
    };
}

export default function VaccinationShow({ vaccination }: ShowProps) {
    return (
        <>
            <Head title={vaccination.vaccine_name} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={vaccinations.index()}><Button variant="ghost" size="icon"><ArrowLeft /></Button></Link>
                    <h1 className="text-xl font-semibold tracking-tight">{vaccination.vaccine_name}</h1>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>Vaccination Details</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div><p className="text-xs text-muted-foreground">Vaccine</p><p className="text-sm font-medium">{vaccination.vaccine_name}</p></div>
                            <div><p className="text-xs text-muted-foreground">Manufacturer</p><p className="text-sm">{vaccination.manufacturer ?? '—'}</p></div>
                            <div><p className="text-xs text-muted-foreground">Batch Number</p><p className="text-sm font-mono">{vaccination.batch_number ?? '—'}</p></div>
                            <div><p className="text-xs text-muted-foreground">Date Administered</p><p className="text-sm">{formatDate(vaccination.date_administered)}</p></div>
                            <div><p className="text-xs text-muted-foreground">Next Due Date</p><p className="text-sm">{vaccination.next_due_date ? <Badge variant={new Date(vaccination.next_due_date) < new Date() ? 'destructive' : 'default'}>{formatDate(vaccination.next_due_date)}</Badge> : '—'}</p></div>
                            {vaccination.notes && <div><p className="text-xs text-muted-foreground">Notes</p><p className="text-sm whitespace-pre-wrap">{vaccination.notes}</p></div>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Patient & Vet</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div><p className="text-xs text-muted-foreground">Pet</p><p className="text-sm font-medium">{vaccination.pet.name} <span className="text-muted-foreground capitalize">({vaccination.pet.species})</span></p></div>
                            <div><p className="text-xs text-muted-foreground">Administered By</p><p className="text-sm">{vaccination.veterinarian.name}</p></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

VaccinationShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Vaccinations', href: vaccinations.index() },
        { title: 'Details', href: '' },
    ],
};
