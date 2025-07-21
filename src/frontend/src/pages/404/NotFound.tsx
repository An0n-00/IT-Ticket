import { Button } from '@/components/ui/button.tsx';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/pages/Main/Main.tsx';

export default function NotFound() {
    return (
        <>
            <Header />
            <div className="flex min-h-[88vh] w-full flex-1 flex-col items-center justify-center gap-6 p-4 text-center">
                <h1 className="text-4xl font-bold">404 - Not Found</h1>
                <p className="text-lg">The page you are looking for does not exist.</p>
                <Button size="lg" asChild>
                    <Link to="/" className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go Back Home
                    </Link>
                </Button>
            </div>
        </>
    );
}
