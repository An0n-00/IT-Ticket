import { LoginForm } from '@/components/auth/forms/login-form.tsx';
import { Header } from '@/pages/Main/Main.tsx';

export default function LoginPage() {
    return (
        <>
            <div className="flex min-h-screen flex-col">
                <Header shadow={false} />
                <div className="mt-10 flex flex-1 flex-col items-center justify-center gap-6 p-6 md:p-10">
                    <div className="w-full max-w-sm">
                        <LoginForm />
                    </div>
                </div>
                <div className="pointer-events-none fixed inset-0 h-full min-h-screen overflow-hidden" style={{ zIndex: -999 }}>
                    <div className="relative top-0 left-0 h-full w-full animate-pulse" style={{ animationDuration: '10s' }}>
                        <div className="bg-primary/60 fixed -top-48 -left-48 h-[40vw] max-h-[600px] min-h-[300px] w-[40vw] max-w-[600px] min-w-[300px] rounded-full blur-[128px]"></div>
                        <div className="bg-primary/30 fixed -top-32 -left-32 h-[30vw] max-h-[400px] min-h-[200px] w-[30vw] max-w-[400px] min-w-[200px] rounded-full blur-[96px]"></div>
                        <div className="bg-primary/20 fixed -top-16 -left-16 h-[20vw] max-h-[200px] min-h-[100px] w-[20vw] max-w-[200px] min-w-[100px] rounded-full blur-[64px]"></div>
                    </div>
                    <div className="right-0 bottom-0 h-full w-full animate-pulse" style={{ animationDuration: '15s' }}>
                        <div className="bg-primary/60 fixed -right-48 -bottom-48 h-[40vw] max-h-[600px] min-h-[300px] w-[40vw] max-w-[600px] min-w-[300px] rounded-full blur-[128px]"></div>
                        <div className="bg-primary/30 fixed -right-32 -bottom-32 h-[30vw] max-h-[400px] min-h-[200px] w-[30vw] max-w-[400px] min-w-[200px] rounded-full blur-[96px]"></div>
                        <div className="bg-primary/20 fixed -right-16 -bottom-16 h-[20vw] max-h-[200px] min-h-[100px] w-[20vw] max-w-[200px] min-w-[100px] rounded-full blur-[64px]"></div>
                    </div>
                </div>
            </div>
        </>
    );
}
