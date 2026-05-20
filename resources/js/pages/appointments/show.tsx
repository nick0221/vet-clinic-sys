import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import appointments from '@/routes/appointments';
import pets from '@/routes/pets';
import medicalRecordsRoute from '@/routes/medical-records';
import { formatDateTime, formatDate } from '@/lib/utils';

interface ShowProps {
    appointment: {
        id: number;
        date_time: string;
        status: string;
        type: string;
        reason: string;
        notes: string | null;
        duration: number;
        pet: { id: number; name: string; species: string; client: { id: number; name: string } };
        client: { id: number; name: string; email: string | null; phone: string | null };
        veterinarian: { id: number; name: string };
    };
    medicalRecords: Array<{
        id: number;
        visit_date: string;
        assessment: string | null;
        veterinarian: { id: number; name: string };
    }>;
    activity: Array<{
        id: number;
        action: string;
        created_at: string;
        user: { id: number; name: string } | null;
        properties: Record<string, string> | null;
    }>;
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    scheduled: 'outline', confirmed: 'default', in_progress: 'default',
    completed: 'secondary', cancelled: 'destructive', no_show: 'destructive',
};

const typeIcons: Record<string, string> = {
    checkup: '🏥', vaccination: '💉', surgery: '🔪', follow_up: '📋',
    emergency: '🚨', dental: '🦷', grooming: '✂️', other: '📌',
};

export default function AppointmentShow({ appointment, medicalRecords, activity }: ShowProps) {
    const hasActivity = activity.length > 0;
    const hasMedicalRecords = medicalRecords.length > 0;

    return (
        <>
            <Head title={`Appointment - ${appointment.pet.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={appointments.index()}><Button variant="ghost" size="icon"><ArrowLeft /></Button></Link>
                    <h1 className="text-xl font-semibold tracking-tight">
                        {typeIcons[appointment.type] ?? '📌'} Appointment: {appointment.pet.name}
                    </h1>
                    <Badge variant={statusColors[appointment.status] ?? 'outline'}>{appointment.status.replace('_', ' ')}</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader><CardTitle>Appointment Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-xs text-muted-foreground">Date & Time</p><p className="text-sm font-medium">{formatDateTime(appointment.date_time)}</p></div>
                                <div><p className="text-xs text-muted-foreground">Duration</p><p className="text-sm font-medium">{appointment.duration} minutes</p></div>
                                <div><p className="text-xs text-muted-foreground">Type</p><p className="text-sm capitalize font-medium">{appointment.type.replace('_', ' ')}</p></div>
                                <div><p className="text-xs text-muted-foreground">Status</p><p className="text-sm"><Badge variant={statusColors[appointment.status] ?? 'outline'}>{appointment.status.replace('_', ' ')}</Badge></p></div>
                            </div>
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
                                <p className="text-xs text-muted-foreground mt-1">Owner: {appointment.pet.client.name}</p>
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

                <div className="grid gap-4 md:grid-cols-2">
                    {hasMedicalRecords && (
                        <Card>
                            <CardHeader><CardTitle>Medical History</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {medicalRecords.map((record) => (
                                        <div key={record.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div>
                                                <p className="text-sm font-medium">{record.assessment ?? 'No diagnosis'}</p>
                                                <p className="text-xs text-muted-foreground">{record.veterinarian.name}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">{formatDate(record.visit_date)}</span>
                                                <Link href={medicalRecordsRoute.show(record.id)}>
                                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">View</Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {hasActivity && (
                        <Card>
                            <CardHeader><CardTitle>Activity Timeline</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-0">
                                    {activity.map((entry, i) => (
                                        <div key={entry.id} className="relative flex gap-3 pb-4 pl-4 last:pb-0">
                                            {i < activity.length - 1 && (
                                                <div className="absolute left-[7px] top-3 h-full w-px bg-border" />
                                            )}
                                            <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" />
                                            <div className="flex-1 pt-0">
                                                <p className="text-sm capitalize">{entry.action.replace('_', ' ')}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {entry.user?.name ?? 'System'} &middot; {formatDateTime(entry.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {!hasMedicalRecords && !hasActivity && (
                    <Card>
                        <CardContent className="py-6 text-center text-sm text-muted-foreground">
                            No medical records or activity history for this appointment.
                        </CardContent>
                    </Card>
                )}
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
