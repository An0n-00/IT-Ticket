import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth.ts';
import { AppSidebar } from '@/components/sidebar/app-sidebar.tsx';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Bell, Calendar, LucideBell, LucideTicket, LucideTicketPercent, LucideTickets, LucideTicketX, Plus, Settings, Ticket, TrendingUp, User } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/lib/api';
import type { Issue, Notification, Priority, Status } from '@/types/api';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';

const DashboardPage: React.FC = () => {
    const { user, token } = useAuth();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [priorities, setPriorities] = useState<Priority[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) return;

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Ensure apiService has the current token
                if (token) {
                    apiService.setToken(token);
                }

                // Fetch user's issues
                const issueIds = await apiService.getIssues();
                const issuesData = await apiService.getMultipleIssues(issueIds);
                setIssues(issuesData);

                // Fetch recent notifications
                const notificationIds = await apiService.getNotifications();
                const notificationsData = await apiService.getMultipleNotifications(notificationIds.slice(0, 5));
                setNotifications(notificationsData);

                // Fetch statuses and priorities for display
                const statusIds = await apiService.getStatuses();
                const statusesData = await apiService.getMultipleStatuses(statusIds);
                setStatuses(statusesData);

                const priorityIds = await apiService.getPriorities();
                const prioritiesData = await apiService.getMultiplePriorities(priorityIds);
                setPriorities(prioritiesData);
            } catch (error) {
                toast.error('Failed to load dashboard data');
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [token]);

    useEffect(() => {
        let ignore = false;
        const fetchAdminRole = async () => {
            if (user) {
                try {
                    const role = await apiService.getRole(user.roleId);
                    if (!ignore) setIsAdmin(role.isAdmin);
                } catch {
                    if (!ignore) setIsAdmin(false);
                }
            }
        };
        fetchAdminRole();
        return () => {
            ignore = true;
        };
    }, [user]);

    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Card className="w-[350px]">
                    <CardHeader>
                        <CardTitle>Loading</CardTitle>
                        <CardDescription>Fetching your information...</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    // Calculate ticket stats
    const totalIssues = issues.length;
    const openIssues = issues.filter((issue) => {
        const status = statuses.find((s) => s.id === issue.statusId);
        return status?.name?.toLowerCase() !== 'resolved';
    }).length;
    const resolvedIssues = issues.filter((issue) => {
        const status = statuses.find((s) => s.id === issue.statusId);
        return status?.name?.toLowerCase() === 'resolved';
    }).length;
    const recentIssues = issues.slice(0, 5);
    const unreadNotifications = notifications.filter((n) => !n.isRead).length;

    const getStatusBadgeVariant = (statusId: string) => {
        const status = statuses.find((s) => s.id === statusId);
        switch (status?.name?.toLowerCase()) {
            case 'open':
                return 'default';
            case 'in progress':
                return 'secondary';
            case 'resolved':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    const getPriorityBadgeVariant = (priorityId: string) => {
        const priority = priorities.find((p) => p.id === priorityId);
        switch (priority?.name?.toLowerCase()) {
            case 'high':
            case 'critical':
                return 'destructive';
            case 'medium':
                return 'default';
            case 'low':
                return 'secondary';
            default:
                return 'secondary';
        }
    };

    return (
        <SidebarProvider defaultOpen>
            <AppSidebar user={user} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex items-center pr-4">
                        <Tooltip>
                            <TooltipTrigger>
                                <div className="relative">
                                    <LucideBell
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate('/notifications');
                                        }}
                                        className="text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                                    />
                                    {unreadNotifications > 0 && (
                                        <Badge variant="destructive" className="absolute -top-2 -right-2 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full text-xs">
                                            {unreadNotifications}
                                        </Badge>
                                    )}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Notifications</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {/* Welcome Section */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Welcome back, {user.firstName || user.username}!</h1>
                            <p className="text-muted-foreground">Here's what's happening with your tickets today.</p>
                        </div>
                        <Button asChild>
                            <Link to="/issues?create=true">
                                <Plus className="mr-2 h-4 w-4" />
                                New Ticket
                            </Link>
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="from-secondary-foreground/10 via-secondary-foreground/20 to-secondary-foreground/30 bg-gradient-to-b">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                                <CardAction>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link to="/issues">
                                                    <LucideTicketPercent className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>View All Tickets</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </CardAction>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-12" /> : totalIssues}</div>
                                <p className="text-muted-foreground text-xs">All time</p>
                            </CardContent>
                        </Card>
                        <Card className="from-destructive/10 via-destructive/20 to-destructive/30 bg-gradient-to-b">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                                <CardAction>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link to="/issues?status=open">
                                                    <LucideTicket className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>View Open Tickets</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </CardAction>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-12" /> : openIssues}</div>
                                <p className="text-muted-foreground text-xs">Need attention</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-b from-green-400/10 via-green-400/20 to-green-400/30">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Resolved Tickets</CardTitle>
                                <CardAction>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link to="/issues?status=resolved">
                                                    <LucideTicketX className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>View Resolved Tickets</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </CardAction>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-12" /> : resolvedIssues}</div>
                                <p className="text-muted-foreground text-xs">Resolved</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                                <CardAction>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link to="/notifications">
                                                    <LucideBell className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Notifications</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </CardAction>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-12" /> : unreadNotifications}</div>
                                <p className="text-muted-foreground text-xs">Unread</p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                        {/* Recent Tickets */}
                        <Card className="w-full max-w-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Recent Tickets
                                </CardTitle>
                                <CardDescription>Your latest ticket activity</CardDescription>
                                <CardAction>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link to="/issues">
                                                    <LucideTickets className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>View All Tickets</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </CardAction>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="space-y-4">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="flex items-center space-x-4">
                                                <Skeleton className="h-10 w-10 rounded" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-[200px] max-w-full" />
                                                    <Skeleton className="h-3 w-[150px] max-w-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : recentIssues.length === 0 ? (
                                    <div className="py-6 text-center">
                                        <Ticket className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                                        <p className="text-muted-foreground text-sm">No tickets yet</p>
                                        <Button variant="outline" size="sm" className="mt-2" asChild>
                                            <Link to="/issues?create=true">Create your first ticket</Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {recentIssues.map((issue) => {
                                            const status = statuses.find((s) => s.id === issue.statusId);
                                            const priority = priorities.find((p) => p.id === issue.priorityId);

                                            return (
                                                <div
                                                    key={issue.id}
                                                    className="hover:bg-muted/50 flex flex-col items-center space-y-2 rounded-lg p-2 transition-colors hover:cursor-pointer sm:flex-row sm:items-start sm:space-y-0 sm:space-x-4"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        navigate(`/issue/${issue.id}`);
                                                    }}
                                                >
                                                    <div className="bg-primary/10 mb-2 flex h-10 w-10 items-center justify-center rounded-full sm:mb-0">
                                                        <Ticket className="text-primary h-5 w-5" />
                                                    </div>
                                                    <div className="w-full min-w-0 flex-1">
                                                        <h4 className="truncate text-sm font-medium">{issue.title}</h4>
                                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                                            <Badge variant={getStatusBadgeVariant(issue.statusId)} className="text-xs">
                                                                {status?.name || 'Unknown'}
                                                            </Badge>
                                                            <Badge variant={getPriorityBadgeVariant(issue.priorityId)} className="text-xs">
                                                                {priority?.name || 'Unknown'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-muted-foreground text-xs">{format(new Date(issue.createdAt), 'MMM dd')}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Notifications */}
                        <Card className="w-full max-w-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    Recent Notifications
                                </CardTitle>
                                <CardAction>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link to="/notifications">
                                                    <LucideBell className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>View All Notifications</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </CardAction>
                                <CardDescription>Latest updates and alerts</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="space-y-4">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="flex items-start space-x-4">
                                                <Skeleton className="h-8 w-8 rounded-full" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-[180px] max-w-full" />
                                                    <Skeleton className="h-3 w-[120px] max-w-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="py-6 text-center">
                                        <Bell className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                                        <p className="text-muted-foreground text-sm">No notifications</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className="hover:bg-muted/50 flex flex-col items-start space-y-2 rounded-lg p-2 transition-colors hover:cursor-pointer sm:flex-row sm:space-y-0 sm:space-x-4"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigate(`/notifications#notification-${notification.id}`);
                                                }}
                                            >
                                                <div className="bg-primary/10 mb-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full sm:mb-0">
                                                    <Bell className="text-primary h-4 w-4" />
                                                </div>
                                                <div className="w-full min-w-0 flex-1">
                                                    <h4 className="text-sm font-medium">{notification.title}</h4>
                                                    <p className="text-muted-foreground truncate text-xs">{notification.message}</p>
                                                    <div className="mt-1 flex flex-wrap items-center gap-1">
                                                        <Calendar className="text-muted-foreground h-3 w-3" />
                                                        <span className="text-muted-foreground text-xs">{format(new Date(notification.createdAt), 'MMM dd, HH:mm')}</span>
                                                        {!notification.isRead && <div className="bg-primary ml-2 h-2 w-2 rounded-full" />}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Quick Actions
                            </CardTitle>
                            <CardDescription>Common tasks and navigation</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className={`grid gap-3 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                                <Button variant="outline" asChild>
                                    <Link to="/issues?create=true" className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Create Ticket
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link to="/issues" className="flex items-center gap-2">
                                        <Ticket className="h-4 w-4" />
                                        View All Tickets
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link to="/account" className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Account Settings
                                    </Link>
                                </Button>
                                {isAdmin ? (
                                    <Button variant="outline" asChild>
                                        <Link to="/admin" className="flex items-center gap-2">
                                            <Settings className="h-4 w-4" />
                                            Admin Panel
                                        </Link>
                                    </Button>
                                ) : (
                                    <></>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default DashboardPage;
