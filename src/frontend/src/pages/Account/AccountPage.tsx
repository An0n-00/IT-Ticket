import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Calendar, Eye, EyeOff, History, Mail, Save, Settings, Shield, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/lib/api';
import type { Issue, Role, UserWithRole } from '@/types/api';
import { useNavigate } from 'react-router-dom';

const AccountPage: React.FC = () => {
    const { user, token, logout } = useAuth();
    const [userDetails, setUserDetails] = useState<UserWithRole | null>(null);
    const [userRole, setUserRole] = useState<Role | null>(null);
    const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [editForm, setEditForm] = useState({
        username: user?.username || '',
        email: user?.email || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !token) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                apiService.setToken(token);

                // Fetch detailed user information
                const userDetailData = await apiService.getUser(user.id);

                setEditForm({
                    username: userDetailData.username || '',
                    email: userDetailData.email || '',
                    firstName: userDetailData.firstName || '',
                    lastName: userDetailData.lastName || '',
                });
                setUserDetails(userDetailData);

                // Fetch user role
                if (userDetailData.roleId) {
                    try {
                        const roleData = await apiService.getRole(userDetailData.roleId);
                        setUserRole(roleData);
                    } catch (error) {
                        console.error('Failed to fetch role:', error);
                    }
                }

                // Fetch recent issues
                try {
                    const issueIds = await apiService.getIssues();
                    if (issueIds.length > 0) {
                        const issuesData = await apiService.getMultipleIssues(issueIds.slice(0, 5));
                        setRecentIssues(issuesData);
                    }
                } catch (error) {
                    console.error('Failed to fetch recent issues:', error);
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                toast.error(error instanceof Error ? 'Failed to load account information: ' + error.message : 'Failed to load account information.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, token]);

    const handleUpdateProfile = async () => {
        if (!user) return;

        setUpdating(true);
        try {
            const updatedUser = await apiService.updateUser(user.id, editForm);
            setUserDetails(updatedUser);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error(error instanceof Error ? 'Failed to load account information: ' + error.message : 'Failed to load account information.');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;

        try {
            await apiService.deleteUser(user.id);
            toast.success('Account deleted successfully');
            logout();
        } catch (error) {
            console.error('Failed to delete account:', error);
        }
    };

    const getRoleColor = (roleName: string) => {
        switch (roleName.toLowerCase()) {
            case 'admin':
                return 'destructive';
            case 'support':
                return 'default';
            case 'user':
                return 'secondary';
            default:
                return 'outline';
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
                                <BreadcrumbItem className="hidden md:block">Account</BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Account Settings</h1>
                            <p className="text-muted-foreground">Manage your account information and preferences</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-64 w-full" />
                        </div>
                    ) : (
                        <Tabs defaultValue="profile" className="w-full">
                            <TabsList className={'w-full'}>
                                <TabsTrigger value="profile">
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                </TabsTrigger>
                                <TabsTrigger value="activity">
                                    <History className="mr-2 h-4 w-4" />
                                    Activity
                                </TabsTrigger>
                                <TabsTrigger value="security">
                                    <Shield className="mr-2 h-4 w-4" />
                                    Security
                                </TabsTrigger>
                            </TabsList>

                            {/* Profile Tab */}
                            <TabsContent value="profile">
                                <div className="grid gap-4 md:grid-cols-3">
                                    {/* Profile Overview */}
                                    <Card className="md:col-span-1">
                                        <CardHeader>
                                            <CardTitle>Profile Overview</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex flex-col items-center space-y-4">
                                                <Avatar className="h-20 w-20">
                                                    <AvatarImage src={'https://api.dicebear.com/9.x/thumbs/svg?seed=' + user.username} alt={user.username} />
                                                    <AvatarFallback className="text-lg">{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-center">
                                                    <h3 className="font-semibold">
                                                        {userDetails?.firstName} {userDetails?.lastName}
                                                    </h3>
                                                    <p className="text-muted-foreground text-sm">@{userDetails?.username}</p>
                                                </div>
                                                {userRole && (
                                                    <Badge variant={getRoleColor(userRole.name)}>
                                                        <Shield className="mr-1 h-3 w-3" />
                                                        {userRole.name}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="text-muted-foreground h-4 w-4" />
                                                    <span>{userDetails?.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="text-muted-foreground h-4 w-4" />
                                                    <span>Joined {userDetails ? new Date(userDetails.createdAt).toLocaleDateString() : 'Unknown'}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Edit Profile */}
                                    <Card className="md:col-span-2">
                                        <CardHeader>
                                            <CardTitle>Edit Profile</CardTitle>
                                            <CardDescription>Update your account information</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="firstName">First Name</Label>
                                                    <Input
                                                        id="firstName"
                                                        value={editForm.firstName}
                                                        onChange={(e) =>
                                                            setEditForm({
                                                                ...editForm,
                                                                firstName: e.target.value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="lastName">Last Name</Label>
                                                    <Input
                                                        id="lastName"
                                                        value={editForm.lastName}
                                                        onChange={(e) =>
                                                            setEditForm({
                                                                ...editForm,
                                                                lastName: e.target.value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="username">Username</Label>
                                                <Input
                                                    id="username"
                                                    value={editForm.username}
                                                    onChange={(e) =>
                                                        setEditForm({
                                                            ...editForm,
                                                            username: e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={editForm.email}
                                                    onChange={(e) =>
                                                        setEditForm({
                                                            ...editForm,
                                                            email: e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button onClick={handleUpdateProfile} className={'w-full'} disabled={updating}>
                                                <Save className="mr-2 h-4 w-4" />
                                                {updating ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* Activity Tab */}
                            <TabsContent value="activity">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Activity</CardTitle>
                                        <CardDescription>Your recent issues and actions</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {recentIssues.length === 0 ? (
                                            <p className="text-muted-foreground py-4 text-center">No recent activity found</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {recentIssues.map((issue) => (
                                                    <div
                                                        key={issue.id}
                                                        className="rounded-lg border p-4 hover:cursor-pointer"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            navigate('/issue/' + issue.id);
                                                        }}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="space-y-1">
                                                                <h4 className="font-medium">{issue.title}</h4>
                                                                <p className="text-muted-foreground line-clamp-2 text-sm">{issue.description}</p>
                                                                <p className="text-muted-foreground text-xs">Created {new Date(issue.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Security Tab */}
                            <TabsContent value="security">
                                <div className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Security Settings</CardTitle>
                                            <CardDescription>Manage your account security and privacy</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label htmlFor="password">Change Password</Label>
                                                <div className="relative">
                                                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter new password" />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute top-1/2 right-2 -translate-y-1/2"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                            <Button disabled>
                                                <Settings className="mr-2 h-4 w-4" />
                                                Update Password (Not implemented)
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                                            <CardDescription>Irreversible and destructive actions</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Account
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete your account? This action cannot be undone. All your data, including issues and comments, will be
                                                            permanently removed.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={handleDeleteAccount}>Delete Account</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default AccountPage;
