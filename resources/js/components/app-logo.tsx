import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { systemSettings } = usePage<{ systemSettings: Record<string, string> }>().props;
    const siteName = systemSettings?.site_name || 'Vet Clinic';
    const logoPath = systemSettings?.brand_logo ? `/storage/${systemSettings.brand_logo}` : null;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                {logoPath ? (
                    <img src={logoPath} alt={siteName} className="size-full object-cover" />
                ) : (
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {siteName}
                </span>
            </div>
        </>
    );
}
