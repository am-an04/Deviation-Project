import React from 'react';
import { useRole } from '../shared/context/RoleContext';
import { Skeleton } from '../shared/components/Skeleton';
import { Button } from '../shared/components/Button';
import { TimelineDemo } from '../features/cro/TimelineDemo';
import { ArchitectureDemo } from '../features/cto/ArchitectureDemo';
import { RulePlayground } from '../features/engineer/RulePlayground';
import { InvestorDashboard } from '../features/investor/InvestorDashboard';
import { Sparkles, ShieldAlert, Cpu, Code2, LineChart } from 'lucide-react';

export const AdaptiveExperience: React.FC = () => {
    const { role, experience, loading, error, setRole } = useRole();

    const roleCapsules: { id: typeof role; label: string; icon: React.ReactNode }[] = [
        { id: 'cro', label: 'Chief Risk Officer', icon: <ShieldAlert className="h-4.5 w-4.5" /> },
        { id: 'cto', label: 'Chief Tech Officer', icon: <Cpu className="h-4.5 w-4.5" /> },
        { id: 'engineer', label: 'Lead Developer', icon: <Code2 className="h-4.5 w-4.5" /> },
        { id: 'investor', label: 'Financial Investor', icon: <LineChart className="h-4.5 w-4.5" /> },
    ];

    if (loading) {
        return (
            <div className="space-y-8 py-8 font-sans max-w-5xl mx-auto">
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-20 w-full mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        );
    }

    if (error || !experience) {
        return (
            <div className="py-12 text-center text-destructive font-sans">
                <p className="font-bold text-lg">Server Error</p>
                <p className="text-sm mt-1">{error || 'Could not resolve experiences content.'}</p>
            </div>
        );
    }

    const renderActiveDemo = () => {
        switch (experience.demoType) {
            case 'timeline':
                return <TimelineDemo />;
            case 'architecture':
                return <ArchitectureDemo />;
            case 'playground':
                return <RulePlayground />;
            case 'dashboard':
                return <InvestorDashboard />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-16 py-8 font-sans max-w-6xl mx-auto">

            {/* Simulation Indicator banner */}
            <div className="border border-[hsl(var(--primary)/15%)] bg-primary/[2%] p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 text-sm animate-in fade-in duration-300">
                <div className="flex items-center gap-2.5">
                    <Sparkles className="h-5 w-5 text-indigo-500 shrink-0" />
                    <p className="text-muted-foreground leading-relaxed leading-5">
                        You are viewing an <strong className="text-foreground">Adaptive Server-Driven UI</strong> tailored for a <strong className="text-foreground">{experience.title}</strong>. Use the toggle buttons to simulate other profile formats.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                    {roleCapsules.map((cap) => (
                        <button
                            key={cap.id}
                            onClick={() => setRole(cap.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors duration-200 ${role === cap.id
                                    ? 'bg-primary text-primary-foreground border-transparent'
                                    : 'bg-card border-border hover:bg-accent text-foreground'
                                }`}
                        >
                            {cap.icon}
                            <span>{cap.label.split(' ')[0]}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Hero Section */}
            <section className="text-center space-y-6 max-w-4xl mx-auto py-4">
                <span className="text-xs px-3 py-1 border border-border bg-card rounded-full font-bold uppercase tracking-wider text-muted-foreground">
                    {experience.focus}
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] max-w-3xl mx-auto">
                    {experience.hero.headline}
                </h1>
                <p className="text-md sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    {experience.hero.subheadline}
                </p>
                <div className="flex justify-center gap-4 pt-2">
                    <Button size="lg" className="font-semibold bg-primary hover:bg-opacity-95 text-primary-foreground cursor-pointer">
                        {experience.cta}
                    </Button>
                    <a href="#demo">
                        <Button size="lg" variant="outline" className="font-semibold cursor-pointer">
                            Launch Simulator
                        </Button>
                    </a>
                </div>
            </section>

            {/* Feature cards Grid */}
            <section className="space-y-6">
                <h3 className="text-xs font-bold text-center text-muted-foreground uppercase tracking-widest">
                    Adaptable Capabilities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {experience.features.map((feature, idx) => (
                        <div key={idx} className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                            <span className="text-xs font-mono font-medium text-muted-foreground uppercase">Fact {idx + 1}</span>
                            <h4 className="text-lg font-bold text-foreground mt-2 mb-2 leading-snug">{feature.title}</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed leading-5">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Main Interactive Demo Container */}
            <section id="demo" className="scroll-mt-24 space-y-6 border-t border-border pt-16">
                <div className="space-y-2">
                    <span className="text-xs px-2.5 py-0.5 border border-primary/20 bg-primary/5 text-foreground rounded font-mono font-semibold uppercase tracking-wider">
                        Interactive Experience
                    </span>
                    <h2 className="text-2xl sm:text-2xl font-bold tracking-tight text-foreground">
                        Role-Based Demo Simulation ({experience.title})
                    </h2>
                </div>
                <div className="w-full">
                    {renderActiveDemo()}
                </div>
            </section>

            {/* Testimonial Quote */}
            <section className="py-12 px-6 sm:px-10 border border-border/80 bg-card rounded-2xl flex flex-col justify-center max-w-4xl mx-auto shadow-sm">
                <div className="text-3xl text-muted-foreground font-serif leading-none italic select-none">&ldquo;</div>
                <p className="text-md sm:text-lg text-foreground italic leading-relaxed font-serif -mt-2">
                    {experience.testimonial.quote}
                </p>
                <div className="mt-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm tracking-wide">
                        {experience.testimonial.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <h5 className="font-semibold text-sm text-foreground">{experience.testimonial.author}</h5>
                        <p className="text-xs text-muted-foreground">{experience.testimonial.position}</p>
                    </div>
                </div>
            </section>

        </div>
    );
};
export default AdaptiveExperience;
