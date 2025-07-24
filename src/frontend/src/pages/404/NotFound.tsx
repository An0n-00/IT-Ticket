import { Button } from '@/components/ui/button.tsx';
import { ArrowLeft, Bug, HomeIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/pages/Main/Main.tsx';

export default function NotFound() {
    return (
        <>
            <Header shadow={false} />
            <div className="flex min-h-[88vh] w-full flex-1 flex-col items-center justify-center gap-6 p-4 text-center">
                <h1 className="text-4xl font-bold">404 - Not Found</h1>
                <p className="text-lg">The page you are looking for does not exist or has moved.</p>
                <div className={'mt-2 flex flex-col items-center justify-center gap-2'}>
                    <Button size="lg" asChild>
                        <Link to="/" className="mt-4">
                            Back Home
                            <HomeIcon />
                        </Link>
                    </Button>
                    <Button size="lg" variant={'ghost'} asChild>
                        <Link to={history.state?.from || '/'} className="mt-4">
                            <ArrowLeft />
                            Back to where you came from
                        </Link>
                    </Button>
                    <Button size="lg" variant={'ghost'} asChild>
                        <Link to="https://github.com/An0n-00/IT-Ticket/issues" target={'_blank'} className="mt-4">
                            Report an issue
                            <Bug />
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    );
}
