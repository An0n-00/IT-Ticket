import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';
import { Bell, FileText, LayoutDashboard, LucidePlusCircle, Settings, Shield, Ticket, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function NavActions() {
    const { role } = useAuth();
    const isAdmin = role?.isAdmin === true;

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Actions</SidebarGroupLabel>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {/* Primary Action Button */}
                    <SidebarMenuItem className="flex items-center gap-2">
                        <SidebarMenuButton
                            asChild
                            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground mb-0 min-w-8 font-semibold duration-200 ease-linear hover:cursor-pointer"
                        >
                            <Link to="/issues?create=true">
                                <LucidePlusCircle />
                                <span>New Ticket</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Main Navigation */}
                    <SidebarMenuItem className="flex items-center gap-2">
                        <SidebarMenuButton asChild>
                            <Link to="/dashboard">
                                <LayoutDashboard />
                                Dashboard
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem className="flex items-center gap-2">
                        <SidebarMenuButton asChild>
                            <Link to="/issues">
                                <Ticket />
                                All Tickets
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem className="flex items-center gap-2">
                        <SidebarMenuButton asChild>
                            <Link to="/account">
                                <User />
                                My Account
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem className="flex items-center gap-2">
                        <SidebarMenuButton asChild>
                            <Link to="/notifications">
                                <Bell />
                                Notifications
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Admin Only Section */}
                    {isAdmin && (
                        <>
                            <SidebarMenuItem className="flex items-center gap-2">
                                <SidebarMenuButton asChild>
                                    <Link to="/admin">
                                        <Shield />
                                        Admin Panel
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem className="flex items-center gap-2">
                                <SidebarMenuButton asChild>
                                    <Link to="/settings">
                                        <Settings />
                                        System Settings
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem className="flex items-center gap-2">
                                <SidebarMenuButton asChild>
                                    <Link to="/audit-logs">
                                        <FileText />
                                        Audit Logs
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </>
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
