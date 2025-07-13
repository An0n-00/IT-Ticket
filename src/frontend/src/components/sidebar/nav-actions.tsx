import { IconCirclePlusFilled, IconDashboard } from '@tabler/icons-react';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function NavActions() {
    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    <SidebarMenuItem className="flex items-center gap-2">
                        <SidebarMenuButton
                            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground mb-0 min-w-8 font-semibold duration-200 ease-linear hover:cursor-pointer"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toast.info('This feature is not implemented yet.', {
                                    description: 'You cannot create tickets yet.',
                                });
                            }}
                        >
                            <IconCirclePlusFilled />
                            <span>New Ticket</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="flex items-center gap-2">
                        <SidebarMenuButton asChild>
                            <Link to={'/dashboard'}>
                                <IconDashboard />
                                Dashboard
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
