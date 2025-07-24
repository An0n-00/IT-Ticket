import { LoginForm } from '@/components/auth/forms/login-form.tsx';
import { Header } from '@/pages/Main/Main.tsx';

export default function LoginPage() {
    return (
        <>
            <div className="flex min-h-screen flex-col">
                <Header shadow={false} />
                <div className="bg-background mt-20 flex flex-col items-center justify-center gap-6 p-6 md:mt-12 md:p-10">
                    <div className="w-full max-w-sm">
                        <LoginForm />
                    </div>
                </div>
            </div>
        </>
    );
}
