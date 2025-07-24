import { BadgeCheck, Bell, LucideEllipsisVertical, LucideHelpCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.tsx';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar.tsx';
import LogOutModal from '@/components/auth/modals/LogOutModal.tsx';
import { Link } from 'react-router-dom';
import { ModeToggle } from '@/components/ui/theme-toggle.tsx';

export function NavUser({
    user,
}: {
    user: {
        name: string;
        email: string;
        avatar: string;
    };
}) {
    const { open, isMobile } = useSidebar();

    return (
        <SidebarMenu>
            <SidebarMenuItem className={`flex p-2 text-sm font-medium ${open ? 'w-full' : 'm-0 p-0'}`}>
                <ModeToggle wide={open} className={`${open ? 'w-full' : 'h-8 w-8'}`} />
            </SidebarMenuItem>
            <SidebarMenuItem>
                <div className="flex w-full items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarFallback className="rounded-lg">{user.avatar}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.name}</span>
                                    <span className="truncate text-xs">{user.email}</span>
                                </div>
                                <LucideEllipsisVertical />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg" side={isMobile ? 'bottom' : 'right'} align="end" sideOffset={4}>
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg">{user.avatar}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{user.name}</span>
                                        <span className="truncate text-xs">{user.email}</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link to={'/account'}>
                                        <BadgeCheck />
                                        Account
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to={'https://github.com/An0n-00/IT-Ticket#:~:text=documentation%20is%20incomplete'} target={'_blank'}>
                                        <LucideHelpCircle />
                                        Help
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Bell />
                                    Notifications
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <LogOutModal />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
