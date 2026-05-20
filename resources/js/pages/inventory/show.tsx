import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import inventory from '@/routes/inventory';
import { formatDate } from '@/lib/utils';

interface ShowProps {
    item: {
        id: number;
        name: string;
        sku: string;
        category: string | null;
        description: string | null;
        quantity_on_hand: number;
        reorder_level: number;
        unit_price: number;
        selling_price: number;
        supplier: string | null;
        expiry_date: string | null;
        is_active: boolean;
    };
}

export default function InventoryShow({ item }: ShowProps) {
    const isLowStock = item.quantity_on_hand <= item.reorder_level;

    return (
        <>
            <Head title={`Inventory - ${item.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={inventory.index()}><Button variant="ghost" size="icon"><ArrowLeft /></Button></Link>
                    <h1 className="text-xl font-semibold tracking-tight">{item.name}</h1>
                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
                        {item.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {isLowStock && <Badge variant="destructive">Low Stock</Badge>}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>Item Details</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div><p className="text-xs text-muted-foreground">Name</p><p className="text-sm">{item.name}</p></div>
                            <div><p className="text-xs text-muted-foreground">SKU</p><p className="text-sm">{item.sku}</p></div>
                            <div><p className="text-xs text-muted-foreground">Category</p><p className="text-sm">{item.category ?? '—'}</p></div>
                            {item.description && <div><p className="text-xs text-muted-foreground">Description</p><p className="text-sm whitespace-pre-wrap">{item.description}</p></div>}
                            <div><p className="text-xs text-muted-foreground">Supplier</p><p className="text-sm">{item.supplier ?? '—'}</p></div>
                            <div><p className="text-xs text-muted-foreground">Expiry Date</p><p className="text-sm">{formatDate(item.expiry_date)}</p></div>
                        </CardContent>
                    </Card>
                    <div className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle>Stock Levels</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Quantity On Hand</p>
                                    <p className={`text-sm font-semibold ${isLowStock ? 'text-destructive' : ''}`}>
                                        {item.quantity_on_hand}
                                    </p>
                                </div>
                                <div><p className="text-xs text-muted-foreground">Reorder Level</p><p className="text-sm">{item.reorder_level}</p></div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div><p className="text-xs text-muted-foreground">Unit Price</p><p className="text-sm">${Number(item.unit_price).toFixed(2)}</p></div>
                                <div><p className="text-xs text-muted-foreground">Selling Price</p><p className="text-sm">${Number(item.selling_price).toFixed(2)}</p></div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

InventoryShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Inventory', href: inventory.index() },
        { title: 'Details', href: '' },
    ],
};
