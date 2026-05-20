import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import invoices from '@/routes/invoices';
import payments from '@/routes/payments';
import { formatDate } from '@/lib/utils';

interface InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    unit_price: string;
    total: string;
    type: string;
}

interface Payment {
    id: number;
    amount: string;
    payment_method: string;
    payment_date: string;
    reference: string | null;
    notes: string | null;
}

interface ShowProps {
    invoice: {
        id: number;
        invoice_number: string;
        subtotal: string;
        tax: string;
        total: string;
        status: string;
        due_date: string | null;
        notes: string | null;
        created_at: string;
        client: { id: number; name: string; email: string | null; phone: string | null };
        pet: { id: number; name: string; species: string };
        veterinarian: { id: number; name: string };
        items: InvoiceItem[];
        payments: Payment[];
    };
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    draft: 'outline',
    pending: 'default',
    paid: 'secondary',
    overdue: 'destructive',
    cancelled: 'outline',
    refunded: 'default',
};

export default function InvoiceShow({ invoice }: ShowProps) {
    const paidAmount = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const balanceDue = Number(invoice.total) - paidAmount;

    return (
        <>
            <Head title={`Invoice #${invoice.invoice_number}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={invoices.index()}><Button variant="ghost" size="icon"><ArrowLeft /></Button></Link>
                    <h1 className="text-xl font-semibold tracking-tight">Invoice #{invoice.invoice_number}</h1>
                    <Badge variant={statusColors[invoice.status] ?? 'outline'}>{invoice.status}</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div><p className="text-xs text-muted-foreground">Invoice #</p><p className="text-sm font-medium">{invoice.invoice_number}</p></div>
                            <div><p className="text-xs text-muted-foreground">Created</p><p className="text-sm">{formatDate(invoice.created_at)}</p></div>
                            <div><p className="text-xs text-muted-foreground">Due Date</p><p className="text-sm">{formatDate(invoice.due_date)}</p></div>
                            <div><p className="text-xs text-muted-foreground">Subtotal</p><p className="text-sm">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(invoice.subtotal))}</p></div>
                            <div><p className="text-xs text-muted-foreground">Tax</p><p className="text-sm">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(invoice.tax))}</p></div>
                            <div><p className="text-xs text-muted-foreground">Total</p><p className="text-sm font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(invoice.total))}</p></div>
                            {invoice.notes && <div><p className="text-xs text-muted-foreground">Notes</p><p className="text-sm whitespace-pre-wrap">{invoice.notes}</p></div>}
                        </CardContent>
                    </Card>
                    <div className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle>Client</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-sm font-medium">{invoice.client.name}</p>
                                <p className="text-xs text-muted-foreground">{invoice.client.email ?? '—'}</p>
                                <p className="text-xs text-muted-foreground">{invoice.client.phone ?? '—'}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Patient</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-sm font-medium">{invoice.pet.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{invoice.pet.species}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Veterinarian</CardTitle></CardHeader>
                            <CardContent><p className="text-sm font-medium">{invoice.veterinarian.name}</p></CardContent>
                        </Card>
                    </div>
                </div>

                <Card>
                    <CardHeader><CardTitle>Invoice Items</CardTitle></CardHeader>
                    <CardContent>
                        {invoice.items.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No items on this invoice.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium">Description</th>
                                            <th className="pb-3 font-medium">Type</th>
                                            <th className="pb-3 font-medium text-right">Qty</th>
                                            <th className="pb-3 font-medium text-right">Unit Price</th>
                                            <th className="pb-3 font-medium text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.items.map((item) => (
                                            <tr key={item.id} className="border-b last:border-0">
                                                <td className="py-3">{item.description}</td>
                                                <td className="py-3 text-muted-foreground capitalize">{item.type}</td>
                                                <td className="py-3 text-right">{item.quantity}</td>
                                                <td className="py-3 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(item.unit_price))}</td>
                                                <td className="py-3 text-right font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(item.total))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Payments</CardTitle>
                        <Badge variant="outline" className="text-sm">
                            Paid: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(paidAmount)}
                            {balanceDue > 0 && ` | Balance: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(balanceDue)}`}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        {invoice.payments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No payments recorded.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium">Date</th>
                                            <th className="pb-3 font-medium">Method</th>
                                            <th className="pb-3 font-medium">Reference</th>
                                            <th className="pb-3 font-medium text-right">Amount</th>
                                            <th className="pb-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.payments.map((payment) => (
                                            <tr key={payment.id} className="border-b last:border-0">
                                                <td className="py-3">{formatDate(payment.payment_date)}</td>
                                                <td className="py-3 capitalize text-muted-foreground">{payment.payment_method.replace('_', ' ')}</td>
                                                <td className="py-3 text-muted-foreground">{payment.reference ?? '—'}</td>
                                                <td className="py-3 text-right font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(payment.amount))}</td>
                                                <td className="py-3 text-right">
                                                    <Link href={payments.show(payment.id)}>
                                                        <Button variant="ghost" size="sm"><Banknote /></Button>
                                                    </Link>
                                                </td>
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

InvoiceShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Invoices', href: invoices.index() },
        { title: 'Invoice Details', href: '' },
    ],
};
