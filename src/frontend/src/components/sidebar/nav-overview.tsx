import React, { useEffect, useState } from 'react';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Bell, BellRing, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import apiService from '@/lib/api';
import { toast } from 'sonner';

export function NavOverview() {
    const { token } = useAuth();
    const [stats, setStats] = useState({
        totalTickets: 0,
        openTickets: 0,
        resolvedTickets: 0,
        unreadNotifications: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;

        let intervalId: NodeJS.Timeout | null = null;

        const fetchStats = async () => {
            setLoading(true);
            try {
                // Fetch user's tickets
                const issueIds = await apiService.getIssues();
                const issues = await apiService.getMultipleIssues(issueIds.slice(0, 20)); // Limit for performance

                // Calculate basic stats
                const totalTickets = issues.length;
                const openTickets = issues.filter((issue) => issue.statusId !== 'resolved' && issue.statusId !== 'resolved').length;
                const resolvedTickets = issues.filter((issue) => issue.statusId === 'resolved').length;

                // Fetch unread notifications
                const notificationIds = await apiService.getNotifications(); // unread only
                const notifications = await apiService.getMultipleNotifications(notificationIds.slice(0, 20)); // Limit for performance
                const unreadNotifications = notifications.filter((notification) => !notification.isRead).length;

                setStats({
                    totalTickets,
                    openTickets,
                    resolvedTickets,
                    unreadNotifications,
                });
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                toast.error(error);
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        // Poll unread notifications every 20 seconds
        intervalId = setInterval(async () => {
            try {
                const notificationIds = await apiService.getNotifications();
                const notifications = await apiService.getMultipleNotifications(notificationIds.slice(0, 20));
                const unreadNotifications = notifications.filter((notification) => !notification.isRead).length;
                setStats((prev) => ({
                    ...prev,
                    unreadNotifications,
                }));
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        }, 15000);

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [token]);

    const StatItem = ({
        icon: Icon,
        label,
        value,
        link,
        variant = 'default',
    }: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        icon: React.ComponentType<any>;
        label: string;
        value: number;
        link: string;
        variant?: 'default' | 'warning' | 'success' | 'info';
    }) => (
        <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-auto">
                <Link to={link} className="flex w-full items-center">
                    <>
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{label}</span>
                        <div className="flex-1" />
                        {loading ? (
                            <Skeleton className="h-5 w-6" />
                        ) : (
                            <Badge variant={variant === 'warning' ? 'destructive' : variant === 'success' ? 'default' : variant === 'info' ? 'secondary' : 'outline'} className="mr-2 py-0 text-xs">
                                {value}
                            </Badge>
                        )}
                    </>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Overview</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    <StatItem icon={TrendingUp} label="Total Tickets" value={stats.totalTickets} link="/issues" variant="info" />
                    <StatItem icon={Clock} label="Open Tickets" value={stats.openTickets} link="/issues?status=Open" variant="warning" />
                    <StatItem icon={CheckCircle} label="Resolved" value={stats.resolvedTickets} link="/issues?status=Resolved" variant="success" />
                    <StatItem
                        icon={stats.unreadNotifications > 0 ? BellRing : Bell}
                        label="Notifications"
                        value={stats.unreadNotifications}
                        link="/notifications"
                        variant={stats.unreadNotifications > 0 ? 'warning' : 'default'}
                    />
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
