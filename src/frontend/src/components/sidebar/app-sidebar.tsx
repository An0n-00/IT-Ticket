// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Logo from '@/public/icon.svg?react';
import { NavUser } from '@/components/sidebar/nav-user.tsx';
import { NavHeader } from '@/components/sidebar/nav-header.tsx';
import { NavOverview } from '@/components/sidebar/nav-overview.tsx';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    SidebarSeparator,
} from '@/components/ui/sidebar.tsx';
import NavActions from '@/components/sidebar/nav-actions';
import type { User } from '@/types/auth.ts';

interface AppSidebarProps {
    user: User | null;
}

export function AppSidebar({ user }: AppSidebarProps) {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <NavHeader
                    info={{
                        name: 'IT-Ticket',
                        logo: Logo,
                    }}
                />
            </SidebarHeader>
            <SidebarContent>
                <NavActions />
                <SidebarSeparator className={'mx-0'} />
                <NavOverview />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
