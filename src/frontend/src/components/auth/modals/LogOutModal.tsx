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
import { LucideCircleX, LucideLogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.ts';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';

export default function LogOutModal() {
    const { logout } = useAuth();

    return (
        <DropdownMenuItem onClick={(e) => e.preventDefault()} className={'outline-none'}>
            <AlertDialog>
                <AlertDialogTrigger
                    asChild
                    className={
                        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground hover:bg-accent relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:cursor-pointer data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                    }
                >
                    <div>
                        <LucideLogOut />
                        Log Out
                    </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure that you want to log out?</AlertDialogTitle>
                        <AlertDialogDescription>Any unsaved changes will be lost.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            <LucideCircleX />
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                logout();
                            }}
                        >
                            <LucideLogOut />
                            Log out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DropdownMenuItem>
    );
}
