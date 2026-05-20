import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Bell, CheckCheck, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import notificationsRoutes from '@/routes/notifications';
import type { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';

type NotificationItem = {
    id: string;
    type: string;
    data: {
        type: string;
        message: string;
        [key: string]: unknown;
    };
    read_at: string | null;
    created_at: string;
};

type PaginatedNotifications = {
    data: NotificationItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
};

export default function NotificationsIndex({
    notifications,
}: {
    notifications: PaginatedNotifications;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Notifications', href: notificationsRoutes.index().url },
    ];

    const handleMarkAsRead = (id: string) => {
        router.post(notificationsRoutes.read({ id: Number(id) }).url);
    };

    const handleMarkAllAsRead = () => {
        router.post(notificationsRoutes.readAll().url);
    };

    const getTimeAgo = (date: string) => {
        const now = new Date();
        const d = new Date(date);
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />

            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                        <p className="text-sm text-muted-foreground">
                            {notifications.total} total notification{notifications.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    {notifications.total > 0 && (
                        <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                            <CheckCheck className="mr-1 size-4" />
                            Mark all read
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">All Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {notifications.data.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                                <Bell className="size-12 opacity-40" />
                                <p className="text-lg font-medium">No notifications yet</p>
                                <p className="text-sm">Notifications will appear here when triggered by scheduled tasks.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {notifications.data.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`flex items-start gap-3 py-3 ${!notif.read_at ? 'bg-muted/30 -mx-6 px-6' : ''}`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-medium leading-tight">
                                                    {!notif.read_at && (
                                                        <span className="mr-1.5 inline-block size-2 rounded-full bg-blue-500 align-middle" />
                                                    )}
                                                    {notif.data.message}
                                                </p>
                                                <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                                                    <Clock className="size-3" />
                                                    {getTimeAgo(notif.created_at)}
                                                </span>
                                            </div>
                                            <div className="mt-1.5 flex items-center gap-2">
                                                {!notif.read_at && (
                                                    <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                                                        New
                                                    </Badge>
                                                )}
                                                {!notif.read_at && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notif.id)}
                                                        className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                                                    >
                                                        Mark as read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {!notif.read_at && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-7 shrink-0"
                                                onClick={() => handleMarkAsRead(notif.id)}
                                            >
                                                <CheckCheck className="size-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {notifications.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                                <span className="text-sm text-muted-foreground">
                                    Page {notifications.current_page} of {notifications.last_page}
                                </span>
                                <div className="flex gap-2">
                                    {notifications.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.get(notificationsRoutes.index({ query: { page: String(notifications.current_page - 1) } }).url)}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {notifications.current_page < notifications.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.get(notificationsRoutes.index({ query: { page: String(notifications.current_page + 1) } }).url)}
                                        >
                                            Next
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
