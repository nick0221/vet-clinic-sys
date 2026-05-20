import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
                    <CardHeader><CardTitle>Procedures</CardTitle></CardHeader>
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
