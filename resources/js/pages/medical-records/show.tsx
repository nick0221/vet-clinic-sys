import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import medicalRecords from '@/routes/medical-records';
import { formatDate } from '@/lib/utils';

interface ShowProps {
    record: {
        id: number;
        visit_date: string;
        subjective: string | null;
        objective: string | null;
        assessment: string | null;
        plan: string | null;
        notes: string | null;
        temperature: string | null;
        heart_rate: number | null;
        respiratory_rate: number | null;
        weight: string | null;
        pet: { id: number; name: string; species: string; client: { id: number; name: string } };
        veterinarian: { id: number; name: string };
        vaccinations: { id: number; vaccine_name: string; date_administered: string; next_due_date: string | null }[];
        prescriptions: { id: number; medication_name: string; dosage: string; frequency: string }[];
    };
}

export default function MedicalRecordShow({ record }: ShowProps) {
    return (
        <>
            <Head title={`Medical Record - ${record.pet.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={medicalRecords.index()}><Button variant="ghost" size="icon"><ArrowLeft /></Button></Link>
                    <h1 className="text-xl font-semibold tracking-tight">Medical Record: {record.pet.name}</h1>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>SOAP Notes</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div><p className="text-xs font-medium text-muted-foreground">Date</p><p className="text-sm">{formatDate(record.visit_date)}</p></div>
                            <div><p className="text-xs font-medium text-muted-foreground">Subjective</p><p className="text-sm whitespace-pre-wrap">{record.subjective ?? '—'}</p></div>
                            <div><p className="text-xs font-medium text-muted-foreground">Objective</p><p className="text-sm whitespace-pre-wrap">{record.objective ?? '—'}</p></div>
                            <div><p className="text-xs font-medium text-muted-foreground">Assessment</p><p className="text-sm whitespace-pre-wrap">{record.assessment ?? '—'}</p></div>
                            <div><p className="text-xs font-medium text-muted-foreground">Plan</p><p className="text-sm whitespace-pre-wrap">{record.plan ?? '—'}</p></div>
                            {record.notes && <div><p className="text-xs font-medium text-muted-foreground">Additional Notes</p><p className="text-sm whitespace-pre-wrap">{record.notes}</p></div>}
                        </CardContent>
                    </Card>
                    <div className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle>Vitals</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-3 gap-4">
                                    <div><p className="text-xs text-muted-foreground">Temperature</p><p className="text-sm font-medium">{record.temperature ? `${record.temperature}°C` : '—'}</p></div>
                                    <div><p className="text-xs text-muted-foreground">Heart Rate</p><p className="text-sm font-medium">{record.heart_rate ? `${record.heart_rate} bpm` : '—'}</p></div>
                                    <div><p className="text-xs text-muted-foreground">Resp. Rate</p><p className="text-sm font-medium">{record.respiratory_rate ? `${record.respiratory_rate} /min` : '—'}</p></div>
                                </div>
                                <div><p className="text-xs text-muted-foreground">Weight</p><p className="text-sm font-medium">{record.weight ? `${record.weight} kg` : '—'}</p></div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Patient & Vet</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                <div><p className="text-xs text-muted-foreground">Pet</p><p className="text-sm font-medium">{record.pet.name} <span className="text-muted-foreground capitalize">({record.pet.species})</span></p></div>
                                <div><p className="text-xs text-muted-foreground">Owner</p><p className="text-sm">{record.pet.client.name}</p></div>
                                <div><p className="text-xs text-muted-foreground">Veterinarian</p><p className="text-sm">{record.veterinarian.name}</p></div>
                            </CardContent>
                        </Card>
                        {record.vaccinations.length > 0 && (
                            <Card>
                                <CardHeader><CardTitle>Vaccinations Given</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {record.vaccinations.map(v => (
                                            <div key={v.id} className="flex justify-between text-sm">
                                                <span>{v.vaccine_name}</span>
                                                <span className="text-muted-foreground">{formatDate(v.date_administered)}{v.next_due_date ? ` → ${formatDate(v.next_due_date)}` : ''}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {record.prescriptions.length > 0 && (
                            <Card>
                                <CardHeader><CardTitle>Prescriptions</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {record.prescriptions.map(p => (
                                            <div key={p.id} className="flex justify-between text-sm">
                                                <span>{p.medication_name}</span>
                                                <span className="text-muted-foreground">{p.dosage} — {p.frequency}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

MedicalRecordShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Medical Records', href: medicalRecords.index() },
        { title: 'Details', href: '' },
    ],
};
