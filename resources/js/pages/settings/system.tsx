import { Head, router, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { edit } from '@/routes/settings/system';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
    settings: Record<string, string>;
};

export default function SystemSettings() {
    const { settings: initial } = usePage<PageProps>().props;
    const [logoPreview, setLogoPreview] = useState<string | null>(
        initial.brand_logo ? `/storage/${initial.brand_logo}` : null,
    );

    const { data, setData, errors, processing, transform } = useForm({
        site_name: initial.site_name ?? '',
        site_description: initial.site_description ?? '',
        site_tagline: initial.site_tagline ?? '',
        address: initial.address ?? '',
        phone: initial.phone ?? '',
        email: initial.email ?? '',
        business_hours: initial.business_hours ?? '',
        brand_logo: null as File | null,
    });

    useEffect(() => {
        setData({
            site_name: initial.site_name ?? '',
            site_description: initial.site_description ?? '',
            site_tagline: initial.site_tagline ?? '',
            address: initial.address ?? '',
            phone: initial.phone ?? '',
            email: initial.email ?? '',
            business_hours: initial.business_hours ?? '',
            brand_logo: null,
        });
        setLogoPreview(initial.brand_logo ? `/storage/${initial.brand_logo}` : null);
    }, [initial]);

    function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setData('brand_logo', file);
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        transform((formData) => {
            const fd = new FormData();
            Object.entries(formData).forEach(([key, val]) => {
                if (key === 'brand_logo' && val instanceof File) {
                    fd.append('brand_logo', val);
                } else if (key !== 'brand_logo') {
                    fd.append(key, val as string);
                }
            });
            fd.append('_method', 'put');
            return fd as unknown as typeof formData;
        });
        router.post(edit(), data, {
            forceFormData: true,
            onSuccess: () => {
                setData('brand_logo', null);
            },
        });
    }

    return (
        <>
            <Head title="System Settings" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="System Settings" description="Configure your clinic's branding and information" />

                <Card>
                    <CardHeader>
                        <CardTitle>Branding</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="site_name">Clinic Name *</Label>
                                    <Input id="site_name" value={data.site_name} onChange={(e) => setData('site_name', e.target.value)} required />
                                    <InputError message={errors.site_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="site_tagline">Tagline</Label>
                                    <Input id="site_tagline" value={data.site_tagline} onChange={(e) => setData('site_tagline', e.target.value)} />
                                    <InputError message={errors.site_tagline} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="site_description">Description</Label>
                                <Textarea id="site_description" value={data.site_description} onChange={(e) => setData('site_description', e.target.value)} rows={3} />
                                <InputError message={errors.site_description} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="brand_logo">Brand Logo</Label>
                                {logoPreview && (
                                    <div className="mb-2">
                                        <img src={logoPreview} alt="Logo preview" className="h-20 w-auto rounded border object-contain" />
                                    </div>
                                )}
                                <Input id="brand_logo" type="file" accept="image/*" onChange={handleLogoChange} />
                                <InputError message={errors.brand_logo} />
                                <p className="text-xs text-muted-foreground">Recommended: square image, at least 200x200px.</p>
                            </div>

                            <div className="border-t pt-6">
                                <CardTitle className="mb-4 text-base">Contact Information</CardTitle>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                        <InputError message={errors.phone} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                        <InputError message={errors.email} />
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} rows={2} />
                                    <InputError message={errors.address} />
                                </div>
                                <div className="mt-4 space-y-2">
                                    <Label htmlFor="business_hours">Business Hours</Label>
                                    <Input id="business_hours" value={data.business_hours} onChange={(e) => setData('business_hours', e.target.value)} />
                                    <InputError message={errors.business_hours} />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Settings
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

SystemSettings.layout = {
    breadcrumbs: [
        { title: 'System Settings', href: edit() },
    ],
};
