import React from 'react';
import { Shield, Cpu, Scale } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../shared/components/Card';
import { Button } from '../shared/components/Button';
import { useNavigate } from 'react-router-dom';

export const About: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-16 py-8 font-sans max-w-4xl mx-auto">

            {/* Article Header */}
            <section className="space-y-4 text-center">
                <span className="text-[10px] px-2.5 py-0.5 border border-primary/20 bg-primary/5 text-foreground rounded font-mono font-semibold uppercase">
                    OUR MISSION
                </span>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                    BPOptima's GroundSet Philosophy
                </h1>
                <p className="text-md sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    GroundSet was built out of a fundamental conviction: Enterprise decisions must be deterministic, auditable, and transparent.
                </p>
            </section>

            {/* Philosophy Body */}
            <section className="space-y-10 border-t border-border pt-12">
                <div className="prose dark:prose-invert max-w-none text-muted-foreground text-sm sm:text-base leading-relaxed space-y-6">
                    <p>
                        In the rush to integrate Large Language Models (LLMs) into production workflows, many enterprises have introduced significant, unmanageable risk. LLMs are probabilistic engines—they predict the next token based on statistical weights. By definition, their outcomes are non-deterministic, prone to hallucination, and fundamentally opaque.
                    </p>
                    <p>
                        <strong>GroundSet takes the opposite approach.</strong> We believe that OCR ingestion and paragraph parsing can leverage machine learning models to structure layouts, but the actual decision-making policies must run under clear, typed, and mathematically deterministic code.
                    </p>
                </div>

                {/* Pillars GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="pb-3 border-b-0">
                            <Shield className="h-6 w-6 text-indigo-500 mb-2" />
                            <CardTitle className="text-sm font-bold">1. Zero Hallucination</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 text-xs text-muted-foreground leading-relaxed">
                            We never route critical underwriting parameters to an LLM to choose 'approve' or 'decline'. Decisions are evaluated using explicit, Pydantic-validated business logic.
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3 border-b-0">
                            <Cpu className="h-6 w-6 text-blue-500 mb-2" />
                            <CardTitle className="text-sm font-bold">2. Dual-Evidence Provenance</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 text-xs text-muted-foreground leading-relaxed">
                            Every resolved fact binds to its physical location coordinate in the source document. Auditing teams can click any number to inspect the exact bounding box in the original PDF.
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3 border-b-0">
                            <Scale className="h-6 w-6 text-amber-500 mb-2" />
                            <CardTitle className="text-sm font-bold">3. Explainable Governance</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 text-xs text-muted-foreground leading-relaxed">
                            GroundSet creates cryptographic audit logs for every invocation. Real-time traces allow compliance officers to verify system state history in milliseconds.
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Call to action */}
            <section className="text-center bg-accent/30 rounded-2xl p-8 border border-border space-y-4">
                <h3 className="text-lg font-bold text-foreground">Ready to try the adaptive experience?</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    See how GroundSet configures UI presentations and interactive dashboards depending on your corporate role.
                </p>
                <Button onClick={() => navigate('/experience')} className="font-semibold bg-primary hover:bg-opacity-95 text-primary-foreground text-sm cursor-pointer">
                    Launch Adaptive Experience
                </Button>
            </section>

        </div>
    );
};
export default About;
