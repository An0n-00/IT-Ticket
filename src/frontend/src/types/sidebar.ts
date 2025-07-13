import * as React from 'react';
import { Sidebar } from '@/components/ui/sidebar.tsx';

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user: {
        name: string;
        email: string;
        avatar: string;
    };
    info?: {
        name: string;
        logo: React.ComponentType;
        plan?: string;
    };
}