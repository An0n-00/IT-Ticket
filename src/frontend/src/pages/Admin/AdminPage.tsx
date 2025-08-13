import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Activity, AlertTriangle, Ban, Calendar, CheckCircle, Crown, Mail, MoreVertical, Settings, Shield, User, UserMinus, Users, XCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import apiService from '@/lib/api';
import type { Role, UserWithRole } from '@/types/api';
import { format } from 'date-fns';

const AdminPage: React.FC = () => {
    const { user, token, role } = useAuth();
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
    const [isElevateDialogOpen, setIsElevateDialogOpen] = useState(false);
    const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);

    // Check if user has admin permissions
    const isAdmin = role?.isAdmin === true;

    useEffect(() => {
        if (!token || !isAdmin) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch users
                const usersData = await apiService.getAllUsers();
                setUsers(usersData);

                // Fetch roles
                const roleIds = await apiService.getRoles();
                const rolesData = await apiService.getMultipleRoles(roleIds);
                setRoles(rolesData);
            } catch (error) {
                toast.error('Failed to load admin data');
                console.error('Error fetching admin data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, isAdmin]);

    const handleElevateUser = async (userId: string) => {
        try {
            const updatedUser = await apiService.elevateUser(userId);
            setUsers(users.map((u) => (u.id === userId ? updatedUser : u)));
            toast.success('User role updated successfully');
            setIsElevateDialogOpen(false);
        } catch (error) {
            toast.error('Failed to update user role');
            console.error('Error elevating user:', error);
        }
    };

    const handleSuspendUser = async (userId: string, suspend: boolean, reason?: string) => {
        try {
            const updatedUser = await apiService.suspendUser(userId, {
                isSuspended: suspend,
                reason,
            });
            setUsers(users.map((u) => (u.id === userId ? updatedUser : u)));
            toast.success(suspend ? 'User suspended successfully' : 'User unsuspended successfully');
            setIsSuspendDialogOpen(false);
        } catch (error) {
            toast.error(suspend ? 'Failed to suspend user' : 'Failed to unsuspend user');
            console.error('Error suspending/unsuspending user:', error);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            await apiService.deleteUser(userId);
            setUsers(users.filter((u) => u.id !== userId));
            toast.success('User deleted successfully');
        } catch (error) {
            toast.error('Failed to delete user');
            console.error('Error deleting user:', error);
        }
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
                                <p className="text-muted-foreground">You don't have permission to access the admin panel.</p>
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
                                <BreadcrumbList className="hidden md:flex">
                                    <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href="/admin">Admin Panel</BreadcrumbLink>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Admin Panel</h1>
                            <p className="text-muted-foreground">Manage users, roles, and system settings</p>
                        </div>
                    </div>

                    <Tabs defaultValue="users" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="users" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Users
                            </TabsTrigger>
                            <TabsTrigger value="roles" className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Roles
                            </TabsTrigger>
                            <TabsTrigger value="system" className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                System
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                Analytics
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="users" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Management</CardTitle>
                                    <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="space-y-4">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <div key={i} className="flex items-center space-x-4">
                                                    <Skeleton className="h-12 w-12 rounded-full" />
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-4 w-[200px]" />
                                                        <Skeleton className="h-4 w-[150px]" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>User</TableHead>
                                                    <TableHead>Role</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Last Login</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {users.map((userItem) => (
                                                    <TableRow key={userItem.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <Avatar>
                                                                    <AvatarImage src={'https://api.dicebear.com/9.x/thumbs/svg?seed=' + userItem.username} alt={userItem.username} />
                                                                    <AvatarFallback>
                                                                        <User className="h-4 w-4" />
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <div className="font-medium">
                                                                        {userItem.firstName} {userItem.lastName}
                                                                    </div>
                                                                    <div className="text-muted-foreground flex items-center gap-1 text-sm">
                                                                        <Mail className="h-3 w-3" />
                                                                        {userItem.email}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={userItem.role?.name === 'Admin' ? 'destructive' : 'secondary'}>{userItem.role?.name || 'No Role'}</Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {userItem.isSuspended ? (
                                                                    <Badge variant="destructive" className="flex items-center gap-1">
                                                                        <XCircle className="h-3 w-3" />
                                                                        Suspended
                                                                    </Badge>
                                                                ) : userItem.isActive ? (
                                                                    <Badge variant="default" className="flex items-center gap-1">
                                                                        <CheckCircle className="h-3 w-3" />
                                                                        Active
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="secondary" className="flex items-center gap-1">
                                                                        <XCircle className="h-3 w-3" />
                                                                        Inactive
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-muted-foreground flex items-center gap-1 text-sm">
                                                                <Calendar className="h-3 w-3" />
                                                                {userItem.lastLoginAt ? format(new Date(userItem.lastLoginAt), 'MMM dd, yyyy') : 'Never'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent>
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setSelectedUser(userItem);
                                                                            setIsElevateDialogOpen(true);
                                                                        }}
                                                                    >
                                                                        <Crown className="mr-2 h-4 w-4" />
                                                                        Change Role
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setSelectedUser(userItem);
                                                                            setIsSuspendDialogOpen(true);
                                                                        }}
                                                                    >
                                                                        <Ban className="mr-2 h-4 w-4" />
                                                                        {userItem.isSuspended ? 'Unsuspend' : 'Suspend'}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(userItem.id)}>
                                                                        <UserMinus className="mr-2 h-4 w-4" />
                                                                        Delete User
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="roles" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Role Management</CardTitle>
                                    <CardDescription>Manage system roles and permissions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="space-y-4">
                                            {Array.from({ length: 3 }).map((_, i) => (
                                                <div key={i} className="space-y-2">
                                                    <Skeleton className="h-6 w-[150px]" />
                                                    <Skeleton className="h-4 w-[300px]" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {roles.map((role) => (
                                                <Card key={role.id}>
                                                    <CardHeader>
                                                        <CardTitle className="text-lg">{role.name}</CardTitle>
                                                        <CardDescription>{role.description}</CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        Coming soon
                                                        {/* 
                                                        <div className="flex flex-wrap gap-2">
                                                            {role.permissions.map((permission) => (
                                                                <Badge key={permission} variant="outline">
                                                                    {permission}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        */}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="system" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>System Settings</CardTitle>
                                    <CardDescription>Configure system-wide settings and preferences</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                                        <Switch id="maintenance-mode" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="user-registration">Allow User Registration</Label>
                                        <Switch id="user-registration" defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="email-notifications">Email Notifications</Label>
                                        <Switch id="email-notifications" defaultChecked />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="analytics" className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                        <Users className="text-muted-foreground h-4 w-4" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{users.length}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                        <CheckCircle className="text-muted-foreground h-4 w-4" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{users.filter((u) => u.isActive && !u.isSuspended).length}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
                                        <Ban className="text-muted-foreground h-4 w-4" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{users.filter((u) => u.isSuspended).length}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
                                        <Shield className="text-muted-foreground h-4 w-4" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{roles.length}</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Elevate User Dialog */}
                <Dialog open={isElevateDialogOpen} onOpenChange={setIsElevateDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Change User Role</DialogTitle>
                            <DialogDescription>
                                Update the role for {selectedUser?.firstName} {selectedUser?.lastName}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Current Role</Label>
                                <p className="text-muted-foreground text-sm">{selectedUser?.role?.name || 'No Role'}</p>
                            </div>
                            <div>
                                <Label>Action</Label>
                                <p className="text-muted-foreground text-sm">This will toggle the user's role elevation.</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsElevateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => selectedUser && handleElevateUser(selectedUser.id)}>Change Role</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Suspend User Dialog */}
                <AlertDialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{selectedUser?.isSuspended ? 'Unsuspend' : 'Suspend'} User</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to {selectedUser?.isSuspended ? 'unsuspend' : 'suspend'} {selectedUser?.firstName} {selectedUser?.lastName}?
                                {!selectedUser?.isSuspended && ' This will prevent them from accessing the system.'}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => selectedUser && handleSuspendUser(selectedUser.id, !selectedUser.isSuspended)}>
                                {selectedUser?.isSuspended ? 'Unsuspend' : 'Suspend'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default AdminPage;
