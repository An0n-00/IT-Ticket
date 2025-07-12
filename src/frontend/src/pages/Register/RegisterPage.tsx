import { RegisterForm } from '@/components/auth/forms/register-form.tsx';
import { Header } from '@/pages/Main/Main.tsx';

export default function RegisterPage() {
    return (
        <>
            <Header />
            <div className="bg-background flex flex-col items-center justify-center gap-6 p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <RegisterForm />
                </div>
            </div>
        </>
    );
}
