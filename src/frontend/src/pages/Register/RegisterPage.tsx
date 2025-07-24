import { RegisterForm } from '@/components/auth/forms/register-form.tsx';
import { Header } from '@/pages/Main/Main.tsx';

export default function RegisterPage() {
    return (
        <>
            <div className="flex min-h-screen flex-col">
                <Header shadow={false} />
                <div className="bg-background mt-12 flex flex-col items-center justify-center gap-6 p-6 md:p-10">
                    <div className="w-full max-w-sm">
                        <RegisterForm />
                    </div>
                </div>
            </div>
        </>
    );
}
