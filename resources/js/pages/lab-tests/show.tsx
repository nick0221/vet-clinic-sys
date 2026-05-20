import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import labTests from '@/routes/lab-tests';

interface ShowProps {
    labTest: {
        id: number;
        name: string;
        description: string | null;
        category: string | null;
        price: number;
        is_active: boolean;
    };
}

export default function LabTestShow({ labTest }: ShowProps) {
    return (
        <>
            <Head title={`Lab Test - ${labTest.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={labTests.index()}><Button variant="ghost" size="icon"><ArrowLeft /></Button></Link>
                    <h1 className="text-xl font-semibold tracking-tight">{labTest.name}</h1>
                    <Badge variant={labTest.is_active ? 'default' : 'secondary'}>
                        {labTest.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>Lab Test Details</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div><p className="text-xs text-muted-foreground">Name</p><p className="text-sm">{labTest.name}</p></div>
                            <div><p className="text-xs text-muted-foreground">Category</p><p className="text-sm">{labTest.category ?? '—'}</p></div>
                            <div><p className="text-xs text-muted-foreground">Price</p><p className="text-sm">${Number(labTest.price).toFixed(2)}</p></div>
                            {labTest.description && <div><p className="text-xs text-muted-foreground">Description</p><p className="text-sm whitespace-pre-wrap">{labTest.description}</p></div>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

LabTestShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Lab Tests', href: labTests.index() },
        { title: 'Details', href: '' },
    ],
};
