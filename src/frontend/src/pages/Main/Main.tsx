import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { ModeToggle as ThemeToggle } from '@/components/ui/theme-toggle';
import { Link, useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, HelpCircle, Home, LucideLogIn, LucideMenu, LucideUserPlus2, TicketIcon, Users } from 'lucide-react';
import green_logo from '@/public/logo-green.svg';
import dashboard_pic from '@/public/dashboard.png';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import RotatingText from '@/components/bits/textanimations/RotatingText/RotatingText.tsx';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Main() {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        setTimeout(() => {
            const element = document.getElementById(hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }

    const scrollToSection = useCallback((sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            window.history.pushState(null, '', `#${sectionId}`);
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    return (
        <div className="flex min-h-screen flex-col">
            <Header id={'header'} />
            <Hero id={'hero'} />
            <Features id={'feats'} />
            <Testimonials id={'testimonials'} />
            <CTA id={'get-started'} />
            <Footer id={'footer'} scrollToSection={scrollToSection} />
        </div>
    );
}

interface HeaderProps {
    id?: string;
}

export function Header({ id }: HeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleScrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            setMobileMenuOpen(false);
            element.scrollIntoView({ behavior: 'smooth' });
        } else if (sectionId === 'hero') {
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <header id={id} className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
            <div className="container flex h-16 items-center justify-between px-3">
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                        <img src={green_logo} alt="IT-Ticket Logo" className="h-8 w-auto" />
                    </Link>
                </div>

                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                                <Link
                                    to="/"
                                    className="flex items-center gap-2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleScrollToSection('hero');
                                    }}
                                >
                                    <div className={'flex items-center gap-2'}>
                                        <Home className="h-4 w-4" />
                                        <span>Home</span>
                                    </div>
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                                <Link to="https://github.com/An0n-00/IT-Ticket#:~:text=documentation%20is%20incomplete" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                    <div className={'flex items-center gap-2'}>
                                        <HelpCircle className="h-4 w-4" />
                                        <span>Help</span>
                                    </div>
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Button variant="outline" asChild className="hidden sm:flex">
                        <Link to="/login">
                            Log in
                            <LucideLogIn />
                        </Link>
                    </Button>
                    <Button asChild className="hidden sm:flex">
                        <Link to="/register">
                            Register
                            <LucideUserPlus2 />
                        </Link>
                    </Button>

                    {/* Mobile Menu */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <LucideMenu />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="flex flex-col">
                            <div className="flex flex-col space-y-4 py-4">
                                <Link
                                    to="/"
                                    className="hover:bg-muted flex items-center gap-2 rounded-md px-4 py-2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleScrollToSection('hero');
                                    }}
                                >
                                    <Home className="h-5 w-5" />
                                    <span>Home</span>
                                </Link>
                                <Link to="/login" className="hover:bg-muted flex items-center gap-2 rounded-md px-4 py-2" onClick={() => setMobileMenuOpen(false)}>
                                    <LucideLogIn className="h-5 w-5" />
                                    <span>Log in</span>
                                </Link>
                                <Link to="/register" className="hover:bg-muted flex items-center gap-2 rounded-md px-4 py-2" onClick={() => setMobileMenuOpen(false)}>
                                    <LucideUserPlus2 className="h-5 w-5" />
                                    <span>Register</span>
                                </Link>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}

interface IdProps {
    id?: string;
}

function Hero({ id }: IdProps) {
    return (
        <section id={id} className="px-4 py-16 md:px-6 md:py-20 lg:py-32">
            <div className="container mx-auto flex flex-col items-center text-center">
                <Badge className="mb-4 animate-pulse">In Beta β</Badge>
                <h1 className="mb-6 flex flex-wrap items-center justify-center gap-2 text-3xl font-bold tracking-tight md:text-4xl lg:text-6xl">
                    <div className="inline-flex">
                        <RotatingText
                            texts={['Streamline', 'Simplify', 'Automate', 'Enhance', 'Optimize', 'Transform']}
                            mainClassName="overflow-hidden justify-center rounded-lg px-2 sm:px-2 md:px-3 bg-primary text-primary-foreground overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg "
                            staggerFrom={'last'}
                            staggerDuration={0.025}
                            splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1 "
                            rotationInterval={3500}
                        />
                    </div>
                    <span className="ml-2">Your IT Support with</span>
                    <span className="text-primary">IT-Ticket</span>
                </h1>

                <p className="text-muted-foreground mb-8 max-w-[800px] text-base md:text-xl">
                    Welcome to your own IT-Ticket Instance!
                    <br className="hidden sm:block" />
                    IT-Ticket is a full-fledged IT ticketing system designed to streamline the process of managing IT requests and incidents. Provide efficient support to your users with our intuitive
                    platform.
                </p>
                <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
                    <Button size="lg" className="group relative w-full overflow-hidden rounded-md sm:w-auto" asChild>
                        <Link to="/login">
                            <span className="relative z-10">Get Started</span>
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                        <Link target="_blank" rel="noopener noreferrer" to="https://github.com/An0n-00/IT-Ticket">
                            Host it yourself
                        </Link>
                    </Button>
                </div>
                <div className="relative mt-12 w-full max-w-[1000px] md:mt-16">
                    <div className="from-primary to-primary/20 absolute -inset-1 rounded-lg bg-gradient-to-r opacity-75 blur-md"></div>
                    <div className="bg-background border-primary/20 relative rounded-lg border p-2 shadow-xl transition-all duration-300 md:p-3">
                        <img src={dashboard_pic} alt="IT-Ticket Dashboard Preview" className="h-auto w-full rounded-md" loading="lazy" />
                    </div>
                </div>
            </div>
        </section>
    );
}

interface FeaturesProps {
    id?: string;
}

function Features({ id }: FeaturesProps) {
    const features = [
        {
            icon: <TicketIcon className="text-primary h-8 w-8 md:h-10 md:w-10" />,
            title: 'Ticket Management',
            description: 'Create, track, and resolve IT tickets efficiently with our intuitive interface.',
        },
        {
            icon: <Users className="text-primary h-8 w-8 md:h-10 md:w-10" />,
            title: 'User Management',
            description: 'Manage users, roles, and permissions with ease to ensure proper access control.',
        },
        {
            icon: <CheckCircle className="text-primary h-8 w-8 md:h-10 md:w-10" />,
            title: 'SLA Compliance',
            description: 'Track and maintain service level agreements with automated notifications and escalations.',
        },
        {
            icon: <Clock className="text-primary h-8 w-8 md:h-10 md:w-10" />,
            title: 'Real-time Updates',
            description: 'Get real-time updates on ticket status and progress to keep everyone informed.',
        },
        {
            icon: <HelpCircle className="text-primary h-8 w-8 md:h-10 md:w-10" />,
            title: 'Knowledge Base',
            description: 'Since all the tickets are stored in a database, you can easily search, find and reference solutions to common issues.',
        },
        {
            icon: <TicketIcon className="text-primary h-8 w-8 md:h-10 md:w-10" />,
            title: 'Reporting & Analytics',
            description: 'Generate comprehensive reports and analytics to track performance and identify trends.',
        },
    ];

    return (
        <section id={id} className="bg-muted/50 py-12 md:py-20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-8 text-center md:mb-16">
                    <h2 className="mb-2 text-2xl font-bold tracking-tight md:mb-4 md:text-3xl">Powerful Features</h2>
                    <p className="text-muted-foreground mx-auto max-w-[800px] text-sm md:text-xl">Everything you need to manage IT support requests efficiently and effectively.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <Card key={index} className="hover:border-primary/50 border-muted border transition-all duration-300 md:border-2">
                            <CardHeader className="p-4 md:p-6">
                                <div className="mb-2 flex">{feature.icon}</div>
                                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                                    {feature.title}
                                    {feature.title === 'SLA Compliance' && (
                                        <Badge variant="secondary" className="ml-2 text-xs">
                                            Coming soon
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                                <p className="text-muted-foreground text-sm md:text-base">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

interface TestimonialsProps {
    id?: string;
}

function Testimonials({ id }: TestimonialsProps) {
    const testimonials = [
        {
            quote: 'IT-Ticket has transformed how we handle IT support requests. Our response times have improved by 45%.',
            author: 'Sarah Johnson',
            role: 'IT Director, Acme Corp',
        },
        {
            quote: "The intuitive interface and powerful features make IT-Ticket the best ticketing system we've ever used.",
            author: 'Michael Chen',
            role: 'Help Desk Manager, Tech-Solutions',
        },
        {
            quote: "We've reduced our ticket resolution time by 30% since implementing IT-Ticket. Highly recommended!",
            author: 'Emily Rodriguez',
            role: 'CIO, NexGen Tech Management Solutions',
        },
    ];

    return (
        <section id={id} className="py-12 md:py-20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-8 text-center md:mb-16">
                    <h2 className="mb-2 text-2xl font-bold tracking-tight md:mb-4 md:text-3xl">What Our Customers Say</h2>
                    <p className="text-muted-foreground mx-auto max-w-[800px] text-sm md:text-xl">Don't just take our word for it. Here's what our customers have to say about IT-Ticket.</p>
                    <p className="text-muted-foreground mx-auto max-w-[800px] text-[8px] italic md:text-[10px]">Note: These testimonials are fictional and for demonstration purposes only.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3 md:gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="bg-muted/30">
                            <CardContent className="p-4 md:p-6">
                                <div className="mb-2 text-3xl md:mb-4 md:text-4xl">"</div>
                                <p className="mb-4 text-sm italic md:mb-6 md:text-base">{testimonial.quote}</p>
                                <div>
                                    <p className="text-sm font-semibold md:text-base">{testimonial.author}</p>
                                    <p className="text-muted-foreground text-xs md:text-sm">{testimonial.role}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

interface CTAProps {
    id?: string;
}

function CTA({ id }: CTAProps) {
    return (
        <section id={id} className="bg-primary text-primary-foreground py-12 md:py-20">
            <div className="container mx-auto px-4 text-center md:px-6">
                <h2 className="mb-2 text-2xl font-bold tracking-tight md:mb-4 md:text-3xl">Ready to streamline your IT support?</h2>
                <p className="text-primary-foreground/90 mx-auto max-w-[800px] text-sm md:text-xl">Join thousands of organizations that trust IT-Ticket for their IT support needs.</p>
                <p className="text-primary-foreground/80 mx-auto mb-6 max-w-[800px] text-[8px] italic md:mb-8 md:text-[10px]">
                    Note: These statistics are fictional and for demonstration purposes only.
                </p>
                <div className="flex w-full flex-col justify-center gap-4 sm:flex-row">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
                        <Link to={'/login'}>Use this Instance</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="text-secondary-foreground w-full sm:w-auto" asChild>
                        <Link to="https://github.com/An0n-00/IT-Ticket">Host your own Instance for Free</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}

interface FooterProps {
    id?: string;
    scrollToSection: (sectionId: string) => void;
}

function Footer({ id, scrollToSection }: FooterProps) {
    return (
        <footer id={id} className="bg-muted py-8 md:py-12">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-6 grid grid-cols-2 gap-6 md:mb-8 md:grid-cols-4 md:gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-3 flex items-center gap-2 md:mb-4">
                            <img src={green_logo} alt="IT-Ticket Logo" className="h-6 w-auto md:h-8" />
                        </div>
                        <p className="text-muted-foreground text-xs md:text-sm">A full-fledged IT ticketing system designed to streamline the process of managing IT requests and incidents.</p>
                    </div>
                    <div>
                        <h3 className="mb-2 text-sm font-semibold md:mb-4 md:text-base">Product</h3>
                        <ul className="space-y-1 md:space-y-2">
                            <li>
                                <Link
                                    to="#feats"
                                    className="text-muted-foreground hover:text-foreground text-xs md:text-sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        scrollToSection('feats');
                                    }}
                                >
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="#hero"
                                    className="text-muted-foreground hover:text-foreground text-xs md:text-sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        scrollToSection('hero');
                                    }}
                                >
                                    Overview
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="#get-started"
                                    className="text-muted-foreground hover:text-foreground text-xs md:text-sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        scrollToSection('get-started');
                                    }}
                                >
                                    Get Started
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-2 text-sm font-semibold md:mb-4 md:text-base">Resources</h3>
                        <ul className="space-y-1 md:space-y-2">
                            <li>
                                <Link
                                    to="https://github.com/An0n-00/IT-Ticket#:~:text=documentation%20is%20incomplete"
                                    className="text-muted-foreground hover:text-foreground text-xs md:text-sm"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Documentation
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="#testimonials"
                                    className="text-muted-foreground hover:text-foreground text-xs md:text-sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        scrollToSection('testimonials');
                                    }}
                                >
                                    Testimonials
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="https://github.com/An0n-00/IT-Ticket/tree/main/src/backend/Controllers"
                                    className="text-muted-foreground hover:text-foreground text-xs md:text-sm"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    API
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-2 text-sm font-semibold md:mb-4 md:text-base">Project</h3>
                        <ul className="space-y-1 md:space-y-2">
                            <li>
                                <Link
                                    to="https://github.com/An0n-00/IT-Ticket?tab=readme-ov-file#it-ticket"
                                    className="text-muted-foreground hover:text-foreground text-xs md:text-sm"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="https://github.com/users/An0n-00/projects/4"
                                    className="text-muted-foreground hover:text-foreground text-xs md:text-sm"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Roadmap
                                </Link>
                            </li>
                            <li>
                                <Link to="https://github.com/An0n-00" className="text-muted-foreground hover:text-foreground text-xs md:text-sm" target="_blank" rel="noopener noreferrer">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <Separator className="mb-6 md:mb-8" />
                <div className="flex flex-col items-center justify-between md:flex-row">
                    <p className="text-muted-foreground text-xs md:text-sm">© {new Date().getFullYear()} IT-Ticket. All rights reserved.</p>
                    <div className="mt-4 flex flex-wrap justify-center gap-4 md:mt-0">
                        <Link
                            to="#"
                            className="text-muted-foreground hover:text-foreground text-xs md:text-sm"
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
                        <Link
                            to="#"
                            className="text-muted-foreground hover:text-foreground text-xs md:text-sm"
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
                        </Link>
                        <Link
                            to="#footer"
                            className="text-muted-foreground hover:text-foreground text-xs md:text-sm"
                            onClick={(e) => {
                                e.preventDefault();
                                toast.success('We do not use/collect any kinds of cookies💪');
                            }}
                        >
                            Cookie Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
