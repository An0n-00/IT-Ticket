import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Activity, AlertTriangle, Calendar, CheckCircle, Edit, Eye, Filter, Info, Search, Settings, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/lib/api';
import type { AuditLog, UserWithRole } from '@/types/api';

const AuditLogsPage: React.FC = () => {
    const { user, token, role } = useAuth();
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAction, setSelectedAction] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

    // Check if user has admin permissions
    const isAdmin = role?.isAdmin === true;

    useEffect(() => {
        if (!token || !isAdmin) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch audit logs
                const auditLogIds = await apiService.getAuditLogs();
                const auditLogsData = await apiService.getMultipleAuditLogs(auditLogIds);
                setAuditLogs(auditLogsData);

                // Fetch users for filtering
                const usersData = await apiService.getAllUsers();
                setUsers(usersData);
            } catch (error) {
                toast.error('Failed to load audit logs');
                console.error('Error fetching audit logs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, isAdmin]);

    const getActionIcon = (action: string) => {
        switch (action.toLowerCase()) {
            case 'create':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'update':
            case 'edit':
                return <Edit className="h-4 w-4 text-blue-500" />;
            case 'delete':
                return <Trash2 className="h-4 w-4 text-red-500" />;
            case 'login':
                return <User className="h-4 w-4 text-green-500" />;
            case 'logout':
                return <User className="h-4 w-4 text-gray-500" />;
            case 'settings':
                return <Settings className="h-4 w-4 text-purple-500" />;
            case 'error':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            default:
                return <Info className="h-4 w-4 text-gray-500" />;
        }
    };

    const getActionBadgeVariant = (action: string) => {
        switch (action.toLowerCase()) {
            case 'create':
                return 'default';
            case 'update':
            case 'edit':
                return 'secondary';
            case 'delete':
                return 'destructive';
            case 'login':
                return 'default';
            case 'logout':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    const filteredLogs = auditLogs.filter((log) => {
        const matchesSearch =
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.entityId.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAction = selectedAction === 'all' || log.action.toLowerCase() === selectedAction.toLowerCase();
        const matchesUser = selectedUser === 'all' || log.userId === selectedUser;

        return matchesSearch && matchesAction && matchesUser;
    });

    const uniqueActions = Array.from(new Set(auditLogs.map((log) => log.action)));

    const handleViewDetails = (log: AuditLog) => {
        setSelectedLog(log);
        setIsDetailDialogOpen(true);
    };

    if (!isAdmin) {
        return (
            <SidebarProvider defaultOpen>
                <AppSidebar user={user} />
                <SidebarInset>
                    <div className="flex min-h-screen items-center justify-center">
                        <Card className="w-96">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="text-destructive h-6 w-6" />
                                    Access Denied
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">You don't have permission to view audit logs.</p>
                            </CardContent>
                        </Card>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

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
                                    <BreadcrumbLink href="/audit-logs">Audit Logs</BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Activity className="h-8 w-8" />
                            <div>
                                <h1 className="text-3xl font-bold">Audit Logs</h1>
                                <p className="text-muted-foreground">Track all system activities and changes</p>
                            </div>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Log</CardTitle>
                            <CardDescription>Monitor all user actions and system events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Filters */}
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                                <div className="flex flex-1 items-center gap-2">
                                    <Search className="text-muted-foreground h-4 w-4" />
                                    <Input placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Filter className="text-muted-foreground h-4 w-4" />
                                    <Select value={selectedAction} onValueChange={setSelectedAction}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Action" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Actions</SelectItem>
                                            {uniqueActions.map((action) => (
                                                <SelectItem key={action} value={action.toLowerCase()}>
                                                    {action}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="text-muted-foreground h-4 w-4" />
                                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="User" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Users</SelectItem>
                                            {users.map((userItem) => (
                                                <SelectItem key={userItem.id} value={userItem.id}>
                                                    {userItem.username}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {loading ? (
                                <div className="space-y-4">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <div key={i} className="flex items-center space-x-4">
                                            <Skeleton className="h-8 w-8 rounded" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-[200px]" />
                                                <Skeleton className="h-3 w-[150px]" />
                                            </div>
                                            <Skeleton className="h-4 w-[100px]" />
                                        </div>
                                    ))}
                                </div>
                            ) : filteredLogs.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Activity className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                                    <h3 className="mb-2 text-lg font-semibold">No audit logs found</h3>
                                    <p className="text-muted-foreground">
                                        {searchTerm || selectedAction !== 'all' || selectedUser !== 'all' ? 'Try adjusting your filters' : 'No activities have been logged yet'}
                                    </p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Action</TableHead>
                                            <TableHead>Entity</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Timestamp</TableHead>
                                            <TableHead>Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLogs.map((log) => {
                                            const logUser = users.find((u) => u.id === log.userId);
                                            return (
                                                <TableRow key={log.id} className="hover:bg-muted/50 cursor-pointer">
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {getActionIcon(log.action)}
                                                            <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{log.entityType}</div>
                                                            <div className="text-muted-foreground text-sm">ID: {log.entityId}...</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
                                                                <User className="h-3 w-3" />
                                                            </div>
                                                            <span className="text-sm">{logUser?.username || 'Unknown User'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Calendar className="text-muted-foreground h-3 w-3" />
                                                            <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(log)}>
                                                            <Eye className="mr-1 h-4 w-4" />
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Detail Dialog */}
                <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {selectedLog && getActionIcon(selectedLog.action)}
                                Audit Log Details
                            </DialogTitle>
                            <DialogDescription>Detailed information about this audit log entry</DialogDescription>
                        </DialogHeader>
                        {selectedLog && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium">Action</Label>
                                        <div className="mt-1">
                                            <Badge variant={getActionBadgeVariant(selectedLog.action)}>{selectedLog.action}</Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Entity Type</Label>
                                        <p className="mt-1 text-sm">{selectedLog.entityType}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Entity ID</Label>
                                        <p className="mt-1 font-mono text-sm text-xs break-all">{selectedLog.entityId}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">User ID</Label>
                                        <p className="mt-1 font-mono text-sm break-all">{selectedLog.userId}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-sm font-medium">Timestamp</Label>
                                        <p className="mt-1 text-sm">{new Date(selectedLog.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">Details</Label>
                                    <Card className="mt-2">
                                        <CardContent className="p-4">
                                            <pre className="overflow-auto text-xs whitespace-pre-wrap">{JSON.stringify(selectedLog.details, null, 2)}</pre>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default AuditLogsPage;
