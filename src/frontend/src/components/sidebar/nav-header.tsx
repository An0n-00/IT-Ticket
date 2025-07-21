import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar.tsx';
import { HomeIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NavHeader({
    info,
}: {
    info: {
        name: string;
        logo: React.ElementType;
    };
}) {
    const Logo = info.logo;
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                    <Link to={'/dashboard'} className="ml-auto flex w-full items-center gap-2">
                        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                            <Logo className="size-6" />
                        </div>
                        <span className="text-base font-semibold">{info.name}</span>
                        <HomeIcon className="ml-auto size-4" />
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
