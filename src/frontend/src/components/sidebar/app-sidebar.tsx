import { BookOpen, SquareTerminal } from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Logo from '@/public/icon.svg?react';
import { NavMain } from '@/components/sidebar/nav-main.tsx';
import { NavUser } from '@/components/sidebar/nav-user.tsx';
import { NavHeader } from '@/components/sidebar/nav-header.tsx';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar.tsx';
import type { AppSidebarProps } from '@/types/sidebar.ts';
import NavActions from '@/components/sidebar/nav-actions';

export function AppSidebar({ user, ...props }: AppSidebarProps) {
    // Use the same navMain as before, but you could also pass this as a prop if needed
    const navMain = [
        {
            title: 'My Tickets',
            url: '',
            icon: SquareTerminal,
            isActive: true,
            items: [
                { title: 'History', url: '/my-tickets/history' },
                { title: 'Starred', url: '#' },
                { title: 'Settings', url: '#' },
            ],
        },
        {
            title: 'Documentation',
            url: '#',
            icon: BookOpen,
            items: [
                { title: 'Introduction', url: '#' },
                { title: 'Get Started', url: '#' },
                { title: 'Tutorials', url: '#' },
                { title: 'Changelog', url: '#' },
            ],
        },
    ];
    return (
        <Sidebar collapsible="icon" {...props}>
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
                <NavMain items={navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={{ ...user, avatar: user.avatar }} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
