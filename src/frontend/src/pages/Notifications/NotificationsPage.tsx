import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Calendar, Check, CheckCircle2, Mail, MailOpen, X } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/lib/api';
import type { Notification } from '@/types/api';
import { cn } from '@/lib/utils';

const NotificationsPage: React.FC = () => {
    const { user, token } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

    useEffect(() => {
        if (!token) return;

        const fetchNotifications = async () => {
            setLoading(true);
            try {
                // Fetch all notifications
                const notificationIds = await apiService.getNotifications();
                const notificationsData = await apiService.getMultipleNotifications(notificationIds);
                setNotifications(notificationsData);
            } catch (error) {
                toast.error('Failed to load notifications');
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [token]);

    const handleMarkAsRead = async (notificationId: string, isRead: boolean) => {
        try {
            await apiService.updateNotification(notificationId, { isRead });
            setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, isRead } : n)));
            toast.success(isRead ? 'Marked as read' : 'Marked as unread');
        } catch (error) {
            toast.error('Failed to update notification');
            console.error('Error updating notification:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter((n) => !n.isRead);
            await Promise.all(unreadNotifications.map((n) => apiService.updateNotification(n.id, { isRead: true })));
            setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
            console.error('Error marking all as read:', error);
        }
    };

    const filteredNotifications = notifications.filter((notification) => {
        switch (filter) {
            case 'unread':
                return !notification.isRead;
            case 'read':
                return notification.isRead;
            default:
                return true;
        }
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <SidebarProvider defaultOpen>
            <AppSidebar user={user} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/notifications">Notifications</BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Bell className="h-8 w-8" />
                                {unreadCount > 0 && (
                                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 min-w-[1.5rem] rounded-full text-xs">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Notifications</h1>
                                <p className="text-muted-foreground">{unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}</p>
                            </div>
                        </div>

                        {unreadCount > 0 && (
                            <Button onClick={handleMarkAllAsRead} variant="outline">
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark All as Read
                            </Button>
                        )}
                    </div>

                    <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'unread' | 'read')}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="all" className="flex items-center gap-2">
                                <Bell className="h-4 w-4" />
                                All ({notifications.length})
                            </TabsTrigger>
                            <TabsTrigger value="unread" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Unread ({unreadCount})
                            </TabsTrigger>
                            <TabsTrigger value="read" className="flex items-center gap-2">
                                <MailOpen className="h-4 w-4" />
                                Read ({notifications.length - unreadCount})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value={filter} className="space-y-4">
                            {loading ? (
                                <div className="space-y-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Card key={i}>
                                            <CardContent className="p-4">
                                                <div className="flex items-start space-x-4">
                                                    <Skeleton className="h-10 w-10 rounded-full" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-4 w-[200px]" />
                                                        <Skeleton className="h-4 w-[300px]" />
                                                        <Skeleton className="h-3 w-[100px]" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <Bell className="text-muted-foreground mb-4 h-12 w-12" />
                                        <h3 className="mb-2 text-lg font-semibold">No notifications</h3>
                                        <p className="text-muted-foreground text-center">
                                            {filter === 'unread'
                                                ? "You don't have any unread notifications."
                                                : filter === 'read'
                                                  ? "You don't have any read notifications."
                                                  : "You don't have any notifications yet."}
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {filteredNotifications.map((notification) => (
                                        <Card
                                            key={notification.id}
                                            id={`notification-${notification.id}`}
                                            className={cn('cursor-pointer transition-all hover:shadow-md', !notification.isRead && 'border-l-primary bg-primary/5 border-l-4')}
                                            onClick={() => handleMarkAsRead(notification.id, !notification.isRead)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex flex-1 items-start space-x-3">
                                                        <div className={cn('mt-1 flex-shrink-0', notification.isRead ? 'opacity-60' : '')}>
                                                            {notification.isRead ? <MailOpen className="text-muted-foreground h-5 w-5" /> : <Mail className="text-primary h-5 w-5" />}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className={cn('font-semibold', notification.isRead ? 'text-muted-foreground' : 'text-foreground')}>{notification.title}</h4>
                                                            <p className={cn('mt-1 text-sm', notification.isRead ? 'text-muted-foreground' : 'text-foreground')}>{notification.message}</p>
                                                            <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
                                                                <Calendar className="h-3 w-3" />
                                                                {new Date(notification.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4 flex items-center gap-2">
                                                        {!notification.isRead && <div className="bg-primary h-2 w-2 rounded-full" />}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMarkAsRead(notification.id, !notification.isRead);
                                                            }}
                                                            className="opacity-0 transition-opacity group-hover:opacity-100"
                                                        >
                                                            {notification.isRead ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default NotificationsPage;
