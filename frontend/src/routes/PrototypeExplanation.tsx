import React from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../shared/components/Card';

export const PrototypeExplanation: React.FC = () => {
    const checklists = [
        {
            category: "Frontend Quality Guidelines",
            items: [
                "React 19 & TypeScript typing configuration - absolute strict configurations on typings.",
                "Server-Driven UI layout - Hero copies, features lists, CTAs, and testimonial authors are fetched directly from endpoints.",
                "State Management - Context API wraps theme toggling and buyer profile simulator states synchronized with sessionStorage.",
                "Interactive experiences - Replay audit timelines (CRO), topological flows (CTO), sandboxed rule calculators (Engineer), and KPI charts (Investor) loaded from backend APIs."
            ]
        },
        {
            category: "Backend Deterministic Verification",
            items: [
                "FastAPI microservice endpoints validating input variables.",
                "POST /api/rule-engine conducts mathematical validation tests without relying on probabilistic model checks.",
                "Audit Trail Hash generation tracing evaluation steps, processed speeds in milliseconds, and rules checklist.",
                "Isolated test suite in Pytest asserting correctness on rules bounds."
            ]
        }
    ];

    return (
        <div className="space-y-12 py-8 font-sans max-w-4xl mx-auto">

            {/* Header */}
            <section className="space-y-3 text-center">
                <span className="text-[10px] px-2.5 py-0.5 border border-primary/20 bg-primary/5 text-foreground rounded font-mono font-semibold uppercase">
                    PROTOTYPE DOCUMENTATION
                </span>
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                    Engineering & Prototype Details
                </h1>
                <p className="text-md text-muted-foreground max-w-xl mx-auto leading-relaxed">
                    How this application models Vercel-like performance and Stripe-grade transaction verification.
                </p>
            </section>

            {/* Grid Checklists */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-12">
                {checklists.map((sec) => (
                    <Card key={sec.category} className="shadow-sm">
                        <CardHeader className="pb-3 border-b-0">
                            <CardTitle className="text-md font-bold flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-indigo-500" />
                                {sec.category}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                                {sec.items.map((it, idx) => (
                                    <li key={idx} className="flex gap-2.5 items-start">
                                        <span className="text-indigo-400 font-bold leading-none mt-1">•</span>
                                        <span className="leading-relaxed leading-5">{it}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </section>

            {/* Technical Summary banner */}
            <section className="bg-accent/30 border border-border p-6 rounded-2xl space-y-4">
                <h3 className="text-md font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-500" />
                    Server-Driven UX Strategy
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed leading-5">
                    By utilizing backend JSON templates to power the landing layouts, we decouple system structure from frontend compilation. If marketing updates copy, features, or client testimonials, modifications are deployed instantly to the client browser without triggering full JS bundle rebuilds.
                </p>
            </section>

        </div>
    );
};
export default PrototypeExplanation;
