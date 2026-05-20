import { Link, router, usePage } from '@inertiajs/react';
import { Bell, CheckCheck, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import notifications from '@/routes/notifications';

type NotificationData = {
    id: string;
    data: {
        type: string;
        message: string;
    };
    created_at: string;
    read_at: string | null;
};

export function NotificationBell() {
    const raw = usePage().props.notifications;
    const notifData = raw && typeof raw === 'object' && 'recent' in raw && Array.isArray((raw as any).recent)
        ? (raw as { unreadCount: number; recent: NotificationData[] })
        : { unreadCount: 0, recent: [] };

    const handleMarkAsRead = (id: string) => {
        router.post(notifications.read({ id }).url);
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

    const handleMarkAllAsRead = () => {
        router.post(notifications.readAll().url);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative size-8">
                    <Bell className="size-5" />
                    {notifData.unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                            {notifData.unreadCount > 9 ? '9+' : notifData.unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {notifData.unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto gap-1 text-xs text-muted-foreground"
                            onClick={handleMarkAllAsRead}
                        >
                            <CheckCheck className="size-3" />
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifData.recent.length === 0 ? (
                    <div className="flex flex-col items-center gap-1 px-4 py-6 text-sm text-muted-foreground">
                        <Bell className="size-8 opacity-50" />
                        <p>No notifications</p>
                    </div>
                ) : (
                    <DropdownMenuGroup>
                        {notifData.recent.map((notif) => (
                            <DropdownMenuItem
                                key={notif.id}
                                className="flex flex-col items-start gap-0.5 py-2.5"
                                onClick={() => handleMarkAsRead(notif.id)}
                            >
                                <span className="text-sm font-medium leading-tight">
                                    {notif.data.message}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {getTimeAgo(notif.created_at)}
                                </span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        href={notifications.index()}
                        className="flex w-full cursor-pointer items-center justify-center gap-1 text-sm font-medium"
                    >
                        View all notifications
                        <ChevronRight className="size-3" />
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
