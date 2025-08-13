import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tag as TagIcon, AlertCircle, CheckCircle2, Flag, Clock } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/lib/api';
import type { Tag, Status, Priority } from '@/types/api';

const SettingsPage: React.FC = () => {
    const { user, token } = useAuth();

    const [tags, setTags] = useState<Tag[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [priorities, setPriorities] = useState<Priority[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                apiService.setToken(token);

                // Fetch all system configuration data
                const [tagIds, statusIds, priorityIds] = await Promise.all([apiService.getTags(), apiService.getStatuses(), apiService.getPriorities()]);

                const [tagsData, statusesData, prioritiesData] = await Promise.all([
                    apiService.getMultipleTags(tagIds),
                    apiService.getMultipleStatuses(statusIds),
                    apiService.getMultiplePriorities(priorityIds),
                ]);

                setTags(tagsData);
                setStatuses(statusesData);
                setPriorities(prioritiesData);
            } catch (error) {
                console.error('Failed to fetch settings data:', error);
                toast.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const getPriorityIcon = (level: number) => {
        if (level >= 4) return <AlertCircle className="h-4 w-4 text-red-500" />;
        if (level >= 2) return <Clock className="h-4 w-4 text-yellow-500" />;
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    };

    if (!user) {
        return (
            <SidebarProvider>
                <AppSidebar user={user} />
                <SidebarInset>
                    <div className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbItem>Settings</BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                            <div className="bg-muted/50 flex aspect-video items-center justify-center rounded-xl">
                                <p>Please log in to view settings</p>
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider>
            <AppSidebar user={user} />
            <SidebarInset>
                <div className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbItem>System Settings</BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="mx-auto w-full max-w-6xl">
                        <div className="flex flex-col space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                            <p className="text-muted-foreground">View system configuration including tags, statuses, and priorities. These settings are managed by system administrators.</p>
                        </div>

                        <Tabs defaultValue="tags" className="mt-6">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="tags">Tags</TabsTrigger>
                                <TabsTrigger value="statuses">Statuses</TabsTrigger>
                                <TabsTrigger value="priorities">Priorities</TabsTrigger>
                            </TabsList>

                            <TabsContent value="tags" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TagIcon className="h-5 w-5" />
                                            Issue Tags
                                        </CardTitle>
                                        <CardDescription>Available tags for categorizing issues</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Description</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {loading ? (
                                                    Array.from({ length: 3 }).map((_, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell>
                                                                <Skeleton className="h-4 w-20" />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Skeleton className="h-4 w-40" />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : tags.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={2} className="text-muted-foreground text-center">
                                                            No tags available
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    tags.map((tag) => (
                                                        <TableRow key={tag.id}>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="outline"
                                                                    style={{
                                                                        borderColor: tag.color || '#3b82f6',
                                                                        color: tag.color || '#3b82f6',
                                                                    }}
                                                                >
                                                                    {tag.name}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground">{tag.description || 'No description'}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="statuses" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Flag className="h-5 w-5" />
                                            Issue Statuses
                                        </CardTitle>
                                        <CardDescription>Available statuses for tracking issue progress</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Description</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {loading ? (
                                                    Array.from({ length: 3 }).map((_, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell>
                                                                <Skeleton className="h-4 w-20" />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Skeleton className="h-4 w-40" />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : statuses.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={2} className="text-muted-foreground text-center">
                                                            No statuses available
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    statuses.map((status) => (
                                                        <TableRow key={status.id}>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="outline"
                                                                    style={{
                                                                        borderColor: status.color || '#3b82f6',
                                                                        color: status.color || '#3b82f6',
                                                                    }}
                                                                >
                                                                    {status.name}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground">{status.description || 'No description'}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="priorities" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5" />
                                            Issue Priorities
                                        </CardTitle>
                                        <CardDescription>Available priority levels for issues</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Priority</TableHead>
                                                    <TableHead>Level</TableHead>
                                                    <TableHead>Description</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {loading ? (
                                                    Array.from({ length: 3 }).map((_, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell>
                                                                <Skeleton className="h-4 w-20" />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Skeleton className="h-4 w-12" />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Skeleton className="h-4 w-40" />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : priorities.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-muted-foreground text-center">
                                                            No priorities available
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    priorities
                                                        .sort((a, b) => b.level - a.level)
                                                        .map((priority) => (
                                                            <TableRow key={priority.id}>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        {getPriorityIcon(priority.level)}
                                                                        <span className="font-medium">{priority.name}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant={priority.level >= 4 ? 'destructive' : priority.level >= 2 ? 'default' : 'secondary'}>Level {priority.level}</Badge>
                                                                </TableCell>
                                                                <TableCell className="text-muted-foreground">{priority.description || 'No description'}</TableCell>
                                                            </TableRow>
                                                        ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default SettingsPage;
