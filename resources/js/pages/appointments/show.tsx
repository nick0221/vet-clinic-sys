import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import appointments from '@/routes/appointments';
import pets from '@/routes/pets';

interface ShowProps {
    appointment: {
        id: number;
        date_time: string;
        status: string;
        type: string;
        reason: string;
        notes: string | null;
        duration: number;
        pet: { id: number; name: string; species: string };
        client: { id: number; name: string; email: string | null; phone: string | null };
        veterinarian: { id: number; name: string };
    };
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    scheduled: 'outline', confirmed: 'default', in_progress: 'default',
    completed: 'secondary', cancelled: 'destructive', no_show: 'destructive',
};

export default function AppointmentShow({ appointment }: ShowProps) {
    return (
        <>
            <Head title={`Appointment - ${appointment.pet.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={appointments.index()}><Button variant="ghost" size="icon"><ArrowLeft /></Button></Link>
                    <h1 className="text-xl font-semibold tracking-tight">Appointment: {appointment.pet.name}</h1>
                    <Badge variant={statusColors[appointment.status] ?? 'outline'}>{appointment.status.replace('_', ' ')}</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>Appointment Details</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div><p className="text-xs text-muted-foreground">Date & Time</p><p className="text-sm">{new Date(appointment.date_time).toLocaleString()}</p></div>
                            <div><p className="text-xs text-muted-foreground">Type</p><p className="text-sm capitalize">{appointment.type.replace('_', ' ')}</p></div>
                            <div><p className="text-xs text-muted-foreground">Duration</p><p className="text-sm">{appointment.duration} minutes</p></div>
                            <div><p className="text-xs text-muted-foreground">Reason</p><p className="text-sm whitespace-pre-wrap">{appointment.reason}</p></div>
                            {appointment.notes && <div><p className="text-xs text-muted-foreground">Notes</p><p className="text-sm whitespace-pre-wrap">{appointment.notes}</p></div>}
                        </CardContent>
                    </Card>
                    <div className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle>Patient</CardTitle></CardHeader>
                            <CardContent>
                                <Link href={pets.show(appointment.pet.id)} className="text-sm font-medium hover:underline">{appointment.pet.name}</Link>
                                <p className="text-xs text-muted-foreground capitalize">{appointment.pet.species}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Owner</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-sm font-medium">{appointment.client.name}</p>
                                <p className="text-xs text-muted-foreground">{appointment.client.email ?? '—'}</p>
                                <p className="text-xs text-muted-foreground">{appointment.client.phone ?? '—'}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Veterinarian</CardTitle></CardHeader>
                            <CardContent><p className="text-sm font-medium">{appointment.veterinarian.name}</p></CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

AppointmentShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Appointments', href: appointments.index() },
        { title: 'Details', href: '' },
    ],
};
