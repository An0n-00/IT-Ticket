import { GalleryVerticalEnd, LucideCircleUser, LucideLockKeyhole, LucideMail, LucideUser, LucideUserPlus } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils.ts';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth.ts';

export function RegisterForm({ className, ...props }: React.ComponentProps<'div'>) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (Object.values(formData).some((value) => !value)) {
            toast.error('Please fill in all fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            setIsSubmitting(true);
            await register({
                username: formData.username.trim(),
                password: formData.password.trim(),
                email: formData.email.trim(),
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
            });
            toast.success('Registration successful!');
            // Navigation is handled by the auth context
        } catch (error) {
            // Error is already handled by the auth context
            // Narrow unknown error before passing to toast
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error(String(error));
            }
            console.error('Registration error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <a href="/" className="flex flex-col items-center gap-2 font-medium">
                            <div className="flex size-8 items-center justify-center rounded-md">
                                <GalleryVerticalEnd className="size-6" />
                            </div>
                            <span className="sr-only">IT-Ticket</span>
                        </a>
                        <h1 className="text-xl font-bold">Welcome to IT-Ticket!</h1>
                        <div className="text-center text-sm">
                            Already have an account?{' '}
                            <Button
                                variant={'link'}
                                type={'button'}
                                onClick={() => {
                                    navigate('/login');
                                }}
                                className="h-0 p-0 underline underline-offset-4"
                            >
                                Log in
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-3">
                            <Label htmlFor="firstName">
                                <LucideUser size={16} />
                                First Name
                            </Label>
                            <Input id="firstName" type="text" autoComplete={'given-name'} placeholder="John" value={formData.firstName} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="lastName">
                                <LucideUser size={16} />
                                Last Name
                            </Label>
                            <Input id="lastName" type="text" autoComplete={'family-name'} placeholder="Doe" value={formData.lastName} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="email">
                                <LucideMail size={16} />
                                Email
                            </Label>
                            <Input id="email" type="email" autoComplete={'email'} placeholder="me@example.com" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="username">
                                <LucideCircleUser size={16} />
                                Username
                            </Label>
                            <Input id="username" type="text" autoComplete={'username'} placeholder="john_doe" value={formData.username} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="password">
                                <LucideLockKeyhole size={16} />
                                Password
                            </Label>
                            <Input id="password" type="password" autoComplete={'new-password'} placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="confirmPassword">
                                <LucideLockKeyhole size={16} />
                                Confirm Password
                            </Label>
                            <Input id="confirmPassword" type="password" autoComplete={'new-password'} placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Registering...' : 'Register'}
                            {!isSubmitting && <LucideUserPlus />}
                        </Button>
                    </div>
                    <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                        <span className="bg-background text-muted-foreground relative z-10 px-2">Or</span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Button
                            variant="outline"
                            type="button"
                            className="w-full"
                            onClick={(e) => {
                                e.preventDefault();
                                toast.error('This feature is not implemented yet');
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path
                                    d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                                    fill="currentColor"
                                />
                            </svg>
                            Continue with Apple
                        </Button>
                        <Button
                            variant="outline"
                            type="button"
                            className="w-full"
                            onClick={(e) => {
                                e.preventDefault();
                                toast.error('This feature is not implemented yet');
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path
                                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                    fill="currentColor"
                                />
                            </svg>
                            Continue with Google
                        </Button>
                    </div>
                </div>
            </form>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By using our service, you agree to our{' '}
                <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                        e.preventDefault();
                        toast.warning('Running Instances do not have a terms of service.', {
                            duration: 10000,
                            closeButton: true,
                            description:
                                'Since this is a running instance, the owner can allow/block actions completely based on her/his will. Hence there is no applicable Terms of Service. If you have any questions, please contact the owner directly.',
                        });
                    }}
                >
                    Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                    to="#"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                        e.preventDefault();
                        toast.warning('Running Instances do not have a privacy policy.', {
                            duration: 10000,
                            closeButton: true,
                            description:
                                'Since this is a running instance, the owner can tweak and modify the system. Hence there is no applicable Privacy Policy. If you have any questions, please contact the owner directly.',
                        });
                    }}
                >
                    Privacy Policy
                </Link>
                .
            </div>
        </div>
    );
}
