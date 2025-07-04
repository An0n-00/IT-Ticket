import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <h1 className="text-4xl font-bold">404 - Not Found</h1>
            <p className="text-lg">The page you are looking for does not exist.</p>
            <Button variant={'default'} asChild>
                <a href="/">
                    <ArrowLeft /> Go to Home
                </a>
            </Button>
        </div>
    );
}
