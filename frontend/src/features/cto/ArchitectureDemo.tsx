import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileUp, SearchCode, Milestone, Terminal, Layers, Radio, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../shared/components/Card';
import { Skeleton } from '../../shared/components/Skeleton';

interface ArchNode {
    id: string;
    label: string;
    type: string;
    description: string;
}

export const ArchitectureDemo: React.FC = () => {
    const [nodes, setNodes] = useState<ArchNode[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<ArchNode | null>(null);

    useEffect(() => {
        const fetchArchitecture = async () => {
            try {
                const res = await axios.get('/api/architecture');
                setNodes(res.data.nodes);

                // Auto select first node
                if (res.data.nodes.length > 0) {
                    setSelectedNode(res.data.nodes[2]); // select GroundSet node by default
                }
                setError(null);
            } catch (err: any) {
                setError('Failed to fetch system architecture layout.');
            } finally {
                setLoading(false);
            }
        };
        fetchArchitecture();
    }, []);

    const getNodeIcon = (id: string) => {
        switch (id) {
            case 'pdf': return <FileUp className="h-5 w-5" />;
            case 'ocr': return <SearchCode className="h-5 w-5" />;
            case 'groundset': return <Milestone className="h-5 w-5" />;
            case 'rules': return <Terminal className="h-5 w-5" />;
            case 'decision': return <Layers className="h-5 w-5" />;
            case 'destinations': return <Radio className="h-5 w-5" />;
            default: return <Milestone className="h-5 w-5" />;
        }
    };

    const getBorderColor = (id: string) => {
        if (selectedNode?.id === id) return 'border-primary ring-2 ring-ring ring-offset-2 dark:ring-offset-card';
        if (hoveredNode === id) return 'border-primary/60 dark:border-primary/45';
        return 'border-border hover:border-muted-foreground/30';
    };

    if (loading) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <Skeleton className="h-7 w-1/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <Skeleton className="h-48 w-full animate-pulse" />
                    </div>
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full border-destructive/20 bg-destructive/5 text-destructive">
                <CardContent className="flex items-center gap-3 py-6 justify-center">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-medium text-sm">{error}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full font-sans border-border">
            <CardHeader>
                <CardTitle className="text-xl">GroundSet Data Ingestion & System Architecture</CardTitle>
                <CardDescription className="text-sm">
                    Interactive flow diagram illustrating facts extraction, schema bindings, and downstream systems execution.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Diagrams Container */}
                    <div className="lg:col-span-2 flex flex-col justify-center border border-border bg-accent/25 dark:bg-accent/5 p-6 rounded-xl relative overflow-hidden min-h-[350px]">
                        {/* Grid background */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                        <div className="relative flex flex-col sm:flex-row flex-wrap items-center justify-center gap-y-12 gap-x-8 max-w-full">
                            {nodes.map((node, index) => {
                                const isSelected = selectedNode?.id === node.id;

                                return (
                                    <React.Fragment key={node.id}>
                                        {/* Node Card */}
                                        <motion.div
                                            whileHover={{ scale: 1.025 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedNode(node)}
                                            onMouseEnter={() => setHoveredNode(node.id)}
                                            onMouseLeave={() => setHoveredNode(null)}
                                            className={`relative z-10 w-[184px] bg-card p-4 rounded-xl border text-center cursor-pointer transition-shadow shadow-sm ${getBorderColor(
                                                node.id
                                            )}`}
                                        >
                                            <div className={`mx-auto h-10 w-10 flex items-center justify-center rounded-lg mb-2.5 transition-colors ${isSelected
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-secondary text-secondary-foreground'
                                                }`}>
                                                {getNodeIcon(node.id)}
                                            </div>
                                            <h5 className="font-semibold text-xs text-foreground tracking-tight line-clamp-1">{node.label}</h5>
                                            <span className="text-[10px] uppercase font-semibold text-muted-foreground px-2 py-0.5 mt-1 bg-accent rounded inline-block">
                                                {node.type}
                                            </span>
                                        </motion.div>

                                        {/* Connection Arrow between nodes / except for last */}
                                        {index < nodes.length - 1 && (
                                            <div className="hidden sm:flex items-center text-muted-foreground select-none pointer-events-none z-0">
                                                <motion.span
                                                    animate={{ x: [0, 4, 0] }}
                                                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                                    className="text-lg font-bold"
                                                >
                                                    →
                                                </motion.span>
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    {/* Metadata Inspector Drawer */}
                    <div className="border border-border rounded-xl p-5 bg-card/60 backdrop-blur-sm flex flex-col justify-between min-h-[300px] shadow-sm">
                        {selectedNode ? (
                            <div className="space-y-4">
                                <div>
                                    <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase block font-semibold">
                                        COMPONENT TYPE: {selectedNode.type}
                                    </span>
                                    <h4 className="text-lg font-bold text-foreground mt-1 flex items-center gap-2">
                                        <span className="text-primary">{getNodeIcon(selectedNode.id)}</span>
                                        {selectedNode.label}
                                    </h4>
                                </div>

                                <p className="text-sm text-foreground leading-relaxed leading-5">
                                    {selectedNode.description}
                                </p>

                                <div className="border-t border-border pt-4 space-y-2 text-xs">
                                    <h5 className="font-bold text-foreground">Integration Parameters</h5>
                                    <div className="bg-accent/40 p-2.5 rounded font-mono text-[11.5px] leading-5 space-y-1">
                                        {selectedNode.id === 'pdf' && (
                                            <>
                                                <div className="text-muted-foreground">in: multipart/form-data</div>
                                                <div className="text-muted-foreground">endpoint: /api/upload</div>
                                                <div className="text-emerald-500">201 Ingest Accepted</div>
                                            </>
                                        )}
                                        {selectedNode.id === 'ocr' && (
                                            <>
                                                <div className="text-muted-foreground">OCR Engine: LayoutParser</div>
                                                <div className="text-muted-foreground">Form Match: PDF BBoxes</div>
                                                <div className="text-indigo-500">Latency: 420 ms</div>
                                            </>
                                        )}
                                        {selectedNode.id === 'groundset' && (
                                            <>
                                                <div className="text-muted-foreground">Module: FactLayouter</div>
                                                <div className="text-muted-foreground">Output: Standardized JSON</div>
                                                <div className="text-indigo-500">Confidence: 99.4%</div>
                                            </>
                                        )}
                                        {selectedNode.id === 'rules' && (
                                            <>
                                                <div className="text-muted-foreground">Engine: Deterministic</div>
                                                <div className="text-muted-foreground">Policy: commercial-loan-v4.2</div>
                                                <div className="text-indigo-500">Matched Rules: {`[4]`}</div>
                                            </>
                                        )}
                                        {selectedNode.id === 'decision' && (
                                            <>
                                                <div className="text-muted-foreground">Format: Signed JWS/JWT</div>
                                                <div className="text-muted-foreground">Audit Signature: sha256</div>
                                                <div className="text-amber-500">Resolution: ReviewEscalated</div>
                                            </>
                                        )}
                                        {selectedNode.id === 'destinations' && (
                                            <>
                                                <div className="text-muted-foreground">Webhook: CRM Salesforce</div>
                                                <div className="text-muted-foreground">Core Sync: SOAP/REST</div>
                                                <div className="text-emerald-500">Sync: 100% Verified</div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground text-sm">
                                Select a node layout to audit connections.
                            </div>
                        )}

                        <div className="text-[10px] text-muted-foreground text-center border-t border-border pt-4 mt-4 font-mono">
                            GroundSet System Topology Diagram
                        </div>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
};
export default ArchitectureDemo;
