import React from 'react';
import { ArchitectureDemo } from '../features/cto/ArchitectureDemo';
import { Network, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../shared/components/Card';

export const SystemDesign: React.FC = () => {
    return (
        <div className="space-y-16 py-8 font-sans max-w-5xl mx-auto">

            {/* Page Header */}
            <section className="space-y-4 text-center">
                <span className="text-[10px] px-2.5 py-0.5 border border-primary/20 bg-primary/5 text-foreground rounded font-mono font-semibold uppercase">
                    SYSTEM DESIGN
                </span>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                    GroundSet Core Architecture
                </h1>
                <p className="text-md sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Technical layout, deployment patterns, and schema validation pipeline powering BPOptima's GroundSet engine.
                </p>
            </section>

            {/* Interactive Graph Box */}
            <section className="border-t border-border pt-12">
                <ArchitectureDemo />
            </section>

            {/* Tech Specifications */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Architectural Specifications</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2.5">
                                <Network className="h-5 w-5 text-indigo-500" />
                                <CardTitle className="text-md font-bold">API Ingestion Pipeline</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="text-xs sm:text-sm text-muted-foreground space-y-2.5">
                            <p>
                                Documents enter the gateway via standard REST requests or webhooks. The gateway computes an instant cryptographic SHA-256 hash to register document identity.
                            </p>
                            <p>
                                Next, the PDF or image stream is dispatched to the layout parsing stage. The layout parser isolates text elements and associates coordinates in a standardized JSON payload structure.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2.5">
                                <Lock className="h-5 w-5 text-blue-500" />
                                <CardTitle className="text-md font-bold">Sovereign Deployment Topology</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="text-xs sm:text-sm text-muted-foreground space-y-2.5">
                            <p>
                                GroundSet is a stateless, Dockerized microservice. It uses no persistent database storage in the evaluation layer, ensuring zero storage footprint.
                            </p>
                            <p>
                                This allows companies to deploy GroundSet in sovereign AWS VPCs, local OpenShift environments, or on-premise clusters. Regulated financial and medical data never leaves your infrastructure boundary.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

        </div>
    );
};
export default SystemDesign;
