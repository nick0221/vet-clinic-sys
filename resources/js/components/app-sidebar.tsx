import { Link, usePage } from '@inertiajs/react';
import {
    Banknote,
    Calendar,
    ClipboardPlus,
    Dna,
    FolderGit2,
    LayoutGrid,
    Microscope,
    Package,
    PawPrint,
    Pill,
    Settings,
    Stethoscope,
    Syringe,
    Users,
} from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import appointments from '@/routes/appointments';
import clients from '@/routes/clients';
import inventory from '@/routes/inventory';
import invoices from '@/routes/invoices';
import labRequests from '@/routes/lab-requests';
import labTests from '@/routes/lab-tests';
import medicalRecords from '@/routes/medical-records';
import pets from '@/routes/pets';
import prescriptions from '@/routes/prescriptions';
import surgeries from '@/routes/surgeries';
import vaccinations from '@/routes/vaccinations';
import veterinarians from '@/routes/veterinarians';
import settingsRoute from '@/routes/settings/system';
import type { NavGroup, NavItem } from '@/types';

function can(permissions: string[], permission: string): boolean {
    return permissions.includes(permission);
}

export function AppSidebar() {
    const { permissions } = usePage().props;

    const navGroups = useMemo((): NavGroup[] => {
        const groups: NavGroup[] = [];

        if (can(permissions, 'dashboard.view')) {
            groups.push({
                label: 'Overview',
                items: [
                    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
                ],
            });
        }

        const patientItems: NavItem[] = [];
        if (can(permissions, 'clients.view-any')) {
            patientItems.push({ title: 'Clients', href: clients.index(), icon: Users });
        }
        if (can(permissions, 'pets.view-any')) {
            patientItems.push({ title: 'Pets', href: pets.index(), icon: PawPrint });
        }
        if (patientItems.length > 0) {
            groups.push({ label: 'Patients', items: patientItems });
        }

        const clinicalItems: NavItem[] = [];
        if (can(permissions, 'appointments.view-any')) {
            clinicalItems.push({ title: 'Appointments', href: appointments.index(), icon: Calendar });
        }
        if (can(permissions, 'medical-records.view-any')) {
            clinicalItems.push({ title: 'Medical Records', href: medicalRecords.index(), icon: ClipboardPlus });
        }
        if (can(permissions, 'vaccinations.view-any')) {
            clinicalItems.push({ title: 'Vaccinations', href: vaccinations.index(), icon: Syringe });
        }
        if (can(permissions, 'prescriptions.view-any')) {
            clinicalItems.push({ title: 'Prescriptions', href: prescriptions.index(), icon: Pill });
        }
        if (clinicalItems.length > 0) {
            groups.push({ label: 'Clinical', items: clinicalItems });
        }

        const businessItems: NavItem[] = [];
        if (can(permissions, 'invoices.view-any')) {
            businessItems.push({ title: 'Invoices', href: invoices.index(), icon: Banknote });
        }
        if (can(permissions, 'inventory.view-any')) {
            businessItems.push({ title: 'Inventory', href: inventory.index(), icon: Package });
        }
        if (businessItems.length > 0) {
            groups.push({ label: 'Business', items: businessItems });
        }

        const labSurgeryItems: NavItem[] = [];
        if (can(permissions, 'lab-tests.view-any')) {
            labSurgeryItems.push({ title: 'Lab Tests', href: labTests.index(), icon: Dna });
        }
        if (can(permissions, 'lab-requests.view-any')) {
            labSurgeryItems.push({ title: 'Lab Requests', href: labRequests.index(), icon: Microscope });
        }
        if (can(permissions, 'surgeries.view-any')) {
            labSurgeryItems.push({ title: 'Surgeries', href: surgeries.index(), icon: FolderGit2 });
        }
        if (labSurgeryItems.length > 0) {
            groups.push({ label: 'Lab & Surgery', items: labSurgeryItems });
        }

        const adminItems: NavItem[] = [];
        if (can(permissions, 'veterinarians.view-any')) {
            adminItems.push({ title: 'Veterinarians', href: veterinarians.index(), icon: Stethoscope });
        }
        if (can(permissions, 'settings.view')) {
            adminItems.push({ title: 'System Settings', href: settingsRoute.edit(), icon: Settings });
        }
        if (adminItems.length > 0) {
            groups.push({ label: 'Administration', items: adminItems });
        }

        return groups;
    }, [permissions]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={navGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
