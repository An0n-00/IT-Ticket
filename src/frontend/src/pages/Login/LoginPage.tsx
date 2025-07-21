import { LoginForm } from '@/components/auth/forms/login-form.tsx';
import { Header } from '@/pages/Main/Main.tsx';

export default function LoginPage() {
    return (
        <>
            <Header />
            <div className="bg-background flex flex-col items-center justify-center gap-6 p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <LoginForm />
                </div>
            </div>
        </>
    );
}
