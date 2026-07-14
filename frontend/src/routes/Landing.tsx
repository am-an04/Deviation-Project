import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Cpu, Code2, LineChart, ChevronRight } from 'lucide-react';
import { useRole, RoleType } from '../shared/context/RoleContext';
import { Card, CardContent } from '../shared/components/Card';
import { Button } from '../shared/components/Button';

export const Landing: React.FC = () => {
    const { setRole } = useRole();
    const navigate = useNavigate();

    const landingRoles: { id: RoleType; label: string; description: string; focus: string; icon: React.ReactNode; color: string }[] = [
        {
            id: 'cro',
            label: 'Chief Risk Officer',
            focus: 'Compliance & Governance',
            description: 'Audit automated resolutions. Inspect decision timelines, evidence provenance, and policy integrity traces.',
            icon: <ShieldAlert className="h-6 w-6 text-amber-500" />,
            color: 'hover:border-amber-500/30'
        },
        {
            id: 'cto',
            label: 'Chief Technology Officer',
            focus: 'Architecture & Ingestion',
            description: 'Review structural pipelines. Standardize layout alignments, microservices schemas, and corporate ERP syncing.',
            icon: <Cpu className="h-6 w-6 text-blue-500" />,
            color: 'hover:border-blue-500/30'
        },
        {
            id: 'engineer',
            label: 'Lead Engineer',
            focus: 'Rules & Schemas SDK',
            description: 'Write policies as code. Run dry validations on inputs. Debug rule execution traces and output JSON payloads.',
            icon: <Code2 className="h-6 w-6 text-emerald-500" />,
            color: 'hover:border-emerald-500/30'
        },
        {
            id: 'investor',
            label: 'Financial Investor',
            focus: 'Value ROI & Expansion',
            description: 'Analyze adoption metrics. Evaluate human review savings, processing latency, and ROI scaling comparative grids.',
            icon: <LineChart className="h-6 w-6 text-violet-500" />,
            color: 'hover:border-violet-500/30'
        }
    ];

    const handleRoleSelection = (roleId: RoleType) => {
        setRole(roleId);
        navigate('/experience');
    };

    return (
        <div className="space-y-20 py-12 sm:py-20 font-sans max-w-5xl mx-auto">

            {/* Landing Hero Section */}
            <section className="text-center space-y-8 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>GroundSet Ingestion Platform</span>
                </div>
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05] max-w-4xl mx-auto">
                    Enterprise decisions deserve <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-foreground via-muted-foreground to-foreground block sm:inline">enterprise transparency.</span>
                </h1>
                <p className="text-md sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    GroundSet resolves unstructured document facts, structures schemas, and processes deterministic rules. Secure, traceable, and audited decisions with zero model hallucinations.
                </p>
                <div className="flex justify-center gap-4 pt-4">
                    <Button
                        size="lg"
                        onClick={() => handleRoleSelection('cro')}
                        className="font-semibold bg-primary hover:bg-opacity-95 text-primary-foreground cursor-pointer"
                    >
                        Launch Experience
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={() => navigate('/about')}
                        className="font-semibold cursor-pointer"
                    >
                        Read Philosophy
                    </Button>
                </div>
            </section>

            {/* Role Selection Container */}
            <section className="space-y-8 border-t border-border pt-16">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Select Your Decision Persona</h2>
                    <p className="text-sm text-muted-foreground">
                        Choose your corporate role below to experience how GroundSet adapts to solve challenges specific to your job.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {landingRoles.map((roleDef) => (
                        <Card
                            key={roleDef.id}
                            onClick={() => handleRoleSelection(roleDef.id)}
                            className={`cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-sm ${roleDef.color}`}
                        >
                            <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <div className="h-10 w-10 bg-secondary rounded-lg flex items-center justify-center">
                                            {roleDef.icon}
                                        </div>
                                        <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-accent px-2 py-0.5 rounded font-mono">
                                            {roleDef.focus}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-foreground font-sans">{roleDef.label}</h3>
                                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed leading-5">
                                            {roleDef.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline self-end">
                                    <span>Enter profile</span>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Scroll indicator/Features list divider */}
            <section className="text-center py-6 text-xs text-muted-foreground border-t border-border pt-12">
                <p>GroundSet by BPOptima &bull; Built for Audit Verification</p>
            </section>

        </div>
    );
};
export default Landing;
