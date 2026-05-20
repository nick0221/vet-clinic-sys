import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import invoices from '@/routes/invoices';

interface ShowProps {
    payment: {
        id: number;
        amount: string;
        payment_method: string;
        payment_date: string;
        reference: string | null;
        notes: string | null;
        created_at: string;
        invoice: {
            id: number;
            invoice_number: string;
            total: string;
            status: string;
            due_date: string | null;
            client: { id: number; name: string };
            pet: { id: number; name: string };
        };
    };
}

export default function PaymentShow({ payment }: ShowProps) {
    return (
        <>
            <Head title="Payment" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={invoices.show(payment.invoice.id)}><Button variant="ghost" size="icon"><ArrowLeft /></Button></Link>
                    <h1 className="text-xl font-semibold tracking-tight">Payment</h1>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div><p className="text-xs text-muted-foreground">Amount</p><p className="text-sm font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(payment.amount))}</p></div>
                            <div><p className="text-xs text-muted-foreground">Method</p><p className="text-sm capitalize">{payment.payment_method.replace('_', ' ')}</p></div>
                            <div><p className="text-xs text-muted-foreground">Payment Date</p><p className="text-sm">{payment.payment_date}</p></div>
                            <div><p className="text-xs text-muted-foreground">Reference</p><p className="text-sm">{payment.reference ?? '—'}</p></div>
                            <div><p className="text-xs text-muted-foreground">Created</p><p className="text-sm">{new Date(payment.created_at).toLocaleDateString()}</p></div>
                            {payment.notes && <div><p className="text-xs text-muted-foreground">Notes</p><p className="text-sm whitespace-pre-wrap">{payment.notes}</p></div>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Invoice</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Invoice #</p>
                                <Link href={invoices.show(payment.invoice.id)} className="text-sm font-medium hover:underline">
                                    {payment.invoice.invoice_number}
                                </Link>
                            </div>
                            <div><p className="text-xs text-muted-foreground">Total</p><p className="text-sm">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(payment.invoice.total))}</p></div>
                            <div><p className="text-xs text-muted-foreground">Client</p><p className="text-sm">{payment.invoice.client.name}</p></div>
                            <div><p className="text-xs text-muted-foreground">Pet</p><p className="text-sm">{payment.invoice.pet.name}</p></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

PaymentShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Invoices', href: invoices.index() },
        { title: 'Payment', href: '' },
    ],
};
