import { LucideServer, Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/ui/theme-provider';

export function ModeToggle({ wide = false, className = '' }: { wide?: boolean; className?: string }) {
    const { setTheme } = useTheme();
    const { theme } = useTheme();

    const themeLabel = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System';
    const themeIcon =
        theme === 'light' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : theme === 'dark' ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <LucideServer className="h-[1.2rem] w-[1.2rem]" />;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size={wide ? 'default' : 'icon'} className={className}>
                    {wide ? (
                        <>
                            {themeIcon}
                            <span className="ml-2">{themeLabel}</span>
                        </>
                    ) : (
                        <>
                            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                            <span className="sr-only">Toggle theme</span>
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun />
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon />
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                    <LucideServer />
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
