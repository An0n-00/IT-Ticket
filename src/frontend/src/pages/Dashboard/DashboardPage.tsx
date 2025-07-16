import React from 'react';
import { useAuth } from '@/hooks/use-auth.ts';
import { AppSidebar } from '@/components/sidebar/app-sidebar.tsx';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const DashboardPage: React.FC = () => {
    const { user, token, BACKEND_URL } = useAuth();
    // @ts-ignore @ts-expect-error
    const [issues, setIssues] = React.useState<any[] | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!token) return;

        const fetchIssues = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${BACKEND_URL}/api/issue`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) throw new Error('Failed to fetch issue IDs');

                const ids: string[] = await res.json();

                if (!Array.isArray(ids) || ids.length === 0) {
                    setIssues([]);
                    return;
                }

                const issuePromises = ids.map((id) =>
                    fetch(`${BACKEND_URL}/api/issue/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }).then((res) => (res.ok ? res.json() : null))
                );
                const issuesData = await Promise.all(issuePromises);
                setIssues(issuesData.filter(Boolean));
            } catch {
                toast.error('Failed to load issues');
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();
    }, [token]);

    // TODO: whatever this is:
    /*
        // Chart data: tickets per month (must be called unconditionally)
        const chartData = React.useMemo(() => {
            if (!issues) return [];
            const byMonth: Record<string, number> = {};
            issues.forEach((issue) => {
                const date = new Date(issue.createdAt);
                const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
                byMonth[key] = (byMonth[key] || 0) + 1;
            });
            return Object.entries(byMonth).map(([month, count]) => ({ month, count }));
        }, [issues]);
    */

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

    // Prepare sidebar user info
    const sidebarUser = {
        name: user.firstName ? `${user.firstName} ${user.lastName}` : user.username,
        email: user.email,
        avatar: user.username.slice(0, 2).toUpperCase(),
    };

    // TODO: Ticket stats
    const total = issues?.length || 8;
    const open = issues?.filter((i) => i.statusId === 'open').length || 2;
    const closed = issues?.filter((i) => i.statusId === 'closed').length || 4;
    const recent = issues?.slice(0, 5) || [];

    return (
        <>
            <SidebarProvider>
                <AppSidebar user={sidebarUser} />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Total Tickets</CardTitle>
                                    <CardDescription>{loading ? <Skeleton className="h-6 w-12" /> : total}</CardDescription>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Open Tickets</CardTitle>
                                    <CardDescription>{loading ? <Skeleton className="h-6 w-12" /> : open}</CardDescription>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Closed Tickets</CardTitle>
                                    <CardDescription>{loading ? <Skeleton className="h-6 w-12" /> : closed}</CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="col-span-1">
                                <CardHeader>
                                    <CardTitle>Tickets per Month</CardTitle>
                                </CardHeader>
                                <div className="h-64">
                                    {loading ? (
                                        <Skeleton className="h-full w-full" />
                                    ) : (
                                        //TODO: Uncomment when chartData is ready
                                        /* Uncomment when chartData is ready
                                    <ChartContainer config={{ count: { color: '#4f46e5' } }}>
                                        <BarChart data={chartData}>
                                            <XAxis dataKey="month" />
                                            <YAxis allowDecimals={false} />
                                            <Bar dataKey="count" fill="var(--color-count)" />
                                            <ChartTooltip content={<ChartTooltip />} />
                                        </BarChart>
                                    </ChartContainer>
                                    */
                                        <div className="text-muted-foreground p-4">Chart data not available yet.</div>
                                    )}
                                </div>
                            </Card>
                            <Card className="col-span-1">
                                <CardHeader>
                                    <CardTitle>Recent Tickets</CardTitle>
                                </CardHeader>
                                <div className="divide-y">
                                    {loading ? (
                                        <Skeleton className="h-32 w-full" />
                                    ) : recent.length === 0 ? (
                                        <div className="text-muted-foreground p-4">No tickets found.</div>
                                    ) : (
                                        recent.map((ticket) => (
                                            <div key={ticket.id} className="p-4">
                                                <div className="font-medium">{ticket.title}</div>
                                                <div className="text-muted-foreground text-xs">{ticket.description}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
};

export default DashboardPage;
