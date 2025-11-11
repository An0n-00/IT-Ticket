import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Calendar, CheckCircle2, Clock, Eye, Filter, PlusCircle, Search, Tag as TagIcon, User } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/lib/api';
import type { Issue, Priority, Status, UserWithRole } from '@/types/api';
import NewIssueDialog from '@/components/Issue/NewIssueDialog.tsx';

const IssuesPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, role } = useAuth();

    const [issues, setIssues] = useState<Issue[]>([]);
    const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [priorities, setPriorities] = useState<Priority[]>([]);
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [createForm, setCreateForm] = useState({
        title: '',
        description: '',
        priorityId: '',
        assigneeId: '',
        tagIds: [] as string[],
    });

    // Read filters from URL params
    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                apiService.setToken(token);

                // Fetch issues
                const issueIds = await apiService.getIssues();
                const issuesData = await apiService.getMultipleIssues(issueIds);
                setIssues(issuesData);
                setFilteredIssues(issuesData);

                // Fetch metadata
                const [statusIds, priorityIds] = await Promise.all([apiService.getStatuses(), apiService.getPriorities()]);

                const [statusesData, prioritiesData] = await Promise.all([apiService.getMultipleStatuses(statusIds), apiService.getMultiplePriorities(priorityIds)]);

                setStatuses(statusesData);
                setPriorities(prioritiesData);

                // Fetch users for assignment (if admin/support)
                if (role?.isAdmin === true || role?.isSupport === true) {
                    setUsers(await apiService.getAllUsers());
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast.error('Failed to load issues');
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // check if '?create=true' query parameter is present
        const urlParams = new URLSearchParams(location.search);
        if (urlParams.get('create') === 'true') {
            setShowCreateDialog(true);
        }
    }, [token, role, location.search]);

    // Sync filter state with URL params (use names)
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        setSearchQuery(urlParams.get('search') || '');
        setStatusFilter(urlParams.get('status') || 'all');
        setPriorityFilter(urlParams.get('priority') || 'all');
    }, [location.search]);

    // Filter issues based on search and filters (map names to ids)
    useEffect(() => {
        let filtered = issues;

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter((issue) => issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || issue.description.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        // Status filter
        if (statusFilter !== 'all' && statuses.length > 0) {
            const statusObj = statuses.find((s) => s.name.toLowerCase() === statusFilter.toLowerCase());
            if (statusObj) {
                filtered = filtered.filter((issue) => issue.statusId === statusObj.id);
            } else {
                filtered = [];
            }
        }

        // Priority filter
        if (priorityFilter !== 'all' && priorities.length > 0) {
            const priorityObj = priorities.find((p) => p.name.toLowerCase() === priorityFilter.toLowerCase());
            if (priorityObj) {
                filtered = filtered.filter((issue) => issue.priorityId === priorityObj.id);
            } else {
                filtered = [];
            }
        }

        setFilteredIssues(filtered);
    }, [issues, searchQuery, statusFilter, priorityFilter, statuses, priorities]);

    // Handlers to update URL params when filters change (use names)
    const handleSearchChange = (value: string) => {
        const params = new URLSearchParams(location.search);
        if (value) {
            params.set('search', value);
        } else {
            params.delete('search');
        }
        navigate({ pathname: location.pathname, search: params.toString() });
    };

    const handleStatusChange = (value: string) => {
        const params = new URLSearchParams(location.search);
        if (value && value !== 'all') {
            params.set('status', value);
        } else {
            params.delete('status');
        }
        navigate({ pathname: location.pathname, search: params.toString() });
    };

    const handlePriorityChange = (value: string) => {
        const params = new URLSearchParams(location.search);
        if (value && value !== 'all') {
            params.set('priority', value);
        } else {
            params.delete('priority');
        }
        navigate({ pathname: location.pathname, search: params.toString() });
    };

    const handleCreateIssue = async () => {
        if (!createForm.title.trim() || !createForm.description.trim()) {
            toast.error('Title and description are required');
            return;
        }

        try {
            const newIssue = await apiService.createIssue({
                title: createForm.title,
                description: createForm.description,
                priorityId: createForm.priorityId || undefined,
                assigneeId: createForm.assigneeId || undefined,
                tagIds: createForm.tagIds.length > 0 ? createForm.tagIds : undefined,
            });

            setIssues([newIssue, ...issues]);
            setCreateForm({
                title: '',
                description: '',
                priorityId: '',
                assigneeId: '',
                tagIds: [],
            });
            setShowCreateDialog(false);
            toast.success('Issue created successfully');
        } catch (error) {
            toast.error(error instanceof Error ? 'Failed to create issue: ' + error.message : 'Failed to create issue');
            console.error('Failed to create issue:', error);
        }
    };

    const getPriorityIcon = (priority: Priority) => {
        if (priority.name.toLowerCase() === 'high') {
            return <AlertCircle className="h-4 w-4 text-red-500" />;
        }
        if (priority.name.toLowerCase() === 'medium') {
            return <Clock className="h-4 w-4 text-yellow-500" />;
        }
        if (priority.name.toLowerCase() === 'low') {
            return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <SidebarProvider>
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
                                <BreadcrumbItem className="hidden md:block">Issues</BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Issues</h1>
                            <p className="text-muted-foreground">Manage and track your IT support tickets</p>
                        </div>
                        <NewIssueDialog
                            showCreateDialog={showCreateDialog}
                            setShowCreateDialog={setShowCreateDialog}
                            createForm={createForm}
                            setCreateForm={setCreateForm}
                            priorities={priorities}
                            users={users}
                            handleCreateIssue={handleCreateIssue}
                        />
                    </div>
                    {/* Filters */}
                    <Card>
                        <CardHeader className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Filter Issues</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                                        <Input placeholder="Search issues..." value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} className="w-full max-w-full pl-7" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Select value={statusFilter} onValueChange={handleStatusChange}>
                                        <SelectTrigger className="w-[140px]">
                                            <Filter className="mr-2 h-4 w-4" />
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            {statuses.map((status) => {
                                                let icon = null;
                                                switch (status.name.toLowerCase()) {
                                                    case 'open':
                                                        icon = <AlertCircle className="mr-2 h-4 w-4 text-red-500" />;
                                                        break;
                                                    case 'in progress':
                                                        icon = <Clock className="mr-2 h-4 w-4 text-yellow-500" />;
                                                        break;
                                                    case 'resolved':
                                                        icon = <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />;
                                                        break;
                                                    default:
                                                        icon = <Eye className="text-muted-foreground mr-2 h-4 w-4" />;
                                                }
                                                return (
                                                    <SelectItem key={status.id} value={status.name}>
                                                        {icon}
                                                        {status.name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    <Select value={priorityFilter} onValueChange={handlePriorityChange}>
                                        <SelectTrigger className="w-[155px]">
                                            <Filter className="mr-2 h-4 w-4" />
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Priority</SelectItem>
                                            {priorities.map((priority) => (
                                                <SelectItem key={priority.id} value={priority.name}>
                                                    {getPriorityIcon(priority)}
                                                    {priority.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Issues List */}
                    <div className="space-y-4">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <Card key={i}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-6 w-3/4" />
                                                <Skeleton className="h-4 w-1/2" />
                                                <Skeleton className="h-4 w-1/4" />
                                            </div>
                                            <div className="space-y-2">
                                                <Skeleton className="h-6 w-20" />
                                                <Skeleton className="h-4 w-16" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : filteredIssues.length === 0 ? (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="py-8 text-center">
                                        <p className="text-muted-foreground">{issues.length === 0 ? 'No issues found. Create your first issue!' : 'No issues match your filters.'}</p>
                                        <Button className="mt-4" variant={'outline'} onClick={() => setShowCreateDialog(true)}>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Create Issue
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredIssues.map((issue) => {
                                const status = statuses.find((s) => s.id === issue.statusId);
                                const priority = priorities.find((p) => p.id === issue.priorityId);

                                return (
                                    <Card key={issue.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => navigate(`/issue/${issue.id}`)}>
                                        <CardHeader className={'flex items-center'}>
                                            <h3 className="text-lg font-semibold">{issue.title}</h3>
                                            {status && (
                                                <Badge variant={'secondary'} className={`bg-${status.color}`}>
                                                    {status.name}
                                                </Badge>
                                            )}
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 space-y-2">
                                                    <p className="text-muted-foreground line-clamp-2 text-sm">{issue.description}</p>
                                                    <div className="text-muted-foreground flex items-center gap-4 text-xs">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(issue.createdAt).toLocaleDateString()}
                                                        </div>
                                                        {issue.assigneeId && (
                                                            <div className="flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                Assigned
                                                            </div>
                                                        )}
                                                        {issue.tags && issue.tags.length > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <TagIcon className="h-3 w-3" />
                                                                {issue.tags.length} tag{issue.tags.length > 1 ? 's' : ''}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {priority && (
                                                        <Badge variant={'outline'} className="flex items-center gap-1">
                                                            {getPriorityIcon(priority)}
                                                            <span className="text-sm">{priority.name}</span>
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default IssuesPage;
