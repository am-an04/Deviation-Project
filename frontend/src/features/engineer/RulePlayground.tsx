import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Play, Code, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../shared/components/Card';
import { Skeleton } from '../../shared/components/Skeleton';
import { Button } from '../../shared/components/Button';

interface RuleInputData {
    income: number;
    creditScore: number;
    employment: string;
    loanAmount: number;
}

interface PlaygroundScenario {
    name: string;
    inputs: RuleInputData;
}

interface RuleOutcome {
    ruleId: string;
    name: string;
    description: string;
    passed: boolean;
    details: string;
}

interface EngineResult {
    decision: string;
    matchedRules: RuleOutcome[];
    evidenceUsed: Record<string, any>;
    reasoning: string[];
    auditTrail: string;
    processingTimeMs: number;
}

export const RulePlayground: React.FC = () => {
    const [scenarios, setScenarios] = useState<PlaygroundScenario[]>([]);
    const [inputs, setInputs] = useState<RuleInputData>({
        income: 120000,
        creditScore: 720,
        employment: 'Employed',
        loanAmount: 45000,
    });

    const [result, setResult] = useState<EngineResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [scenariosLoading, setScenariosLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Load scenarios from Backend
    useEffect(() => {
        const fetchScenarios = async () => {
            try {
                const res = await axios.get('/api/playground');
                setScenarios(res.data);
                if (res.data.length > 0) {
                    setInputs(res.data[0].inputs);
                }
            } catch (err) {
                console.error('Failed to load preset scenarios.');
            } finally {
                setScenariosLoading(false);
            }
        };
        fetchScenarios();
    }, []);

    const handleRunEvaluation = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Artificially wait 400ms to show real-time processing tracer
        await new Promise((resolve) => setTimeout(resolve, 400));

        try {
            const res = await axios.post('/api/rule-engine', inputs);
            setResult(res.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Evaluation payload error.');
        } finally {
            setLoading(false);
        }
    };

    const getDecisionStyles = (decision: string) => {
        switch (decision) {
            case 'Approved':
                return {
                    bg: 'bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
                    icon: <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
                };
            case 'Declined':
                return {
                    bg: 'bg-destructive/10 dark:bg-destructive/5 border-destructive/20 text-destructive',
                    icon: <XCircle className="h-6 w-6 text-destructive" />,
                };
            default:
                return {
                    bg: 'bg-amber-500/10 dark:bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400',
                    icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
                };
        }
    };

    return (
        <Card className="w-full font-sans border-border">
            <CardHeader>
                <CardTitle className="text-xl">GroundSet Deterministic Policy Playground</CardTitle>
                <CardDescription className="text-sm">
                    Run loan decision policies inside the GroundSet schema pipeline. Change variables below to trigger rules or choose standard profile scenarios.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Inputs Section */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Scenarios Preset Selection */}
                        {scenariosLoading ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Load Preset Profiles</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {scenarios.map((scen) => {
                                        const isMatched = JSON.stringify(scen.inputs) === JSON.stringify(inputs);
                                        return (
                                            <button
                                                key={scen.name}
                                                onClick={() => setInputs(scen.inputs)}
                                                className={`text-xs p-2 text-left rounded-lg border font-medium transition-colors hover:bg-accent cursor-pointer ${isMatched
                                                    ? 'bg-accent border-primary text-foreground'
                                                    : 'bg-card border-border text-muted-foreground'
                                                    }`}
                                            >
                                                {scen.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleRunEvaluation} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Annual Income */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground" htmlFor="income">Annual Income ($)</label>
                                    <input
                                        id="income"
                                        type="number"
                                        value={inputs.income}
                                        onChange={(e) => setInputs({ ...inputs, income: Math.max(0, parseInt(e.target.value) || 0) })}
                                        className="w-full px-3 py-2 border border-border bg-card rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                        required
                                    />
                                </div>

                                {/* Credit Score */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground" htmlFor="credit">Credit Score (300-850)</label>
                                    <input
                                        id="credit"
                                        type="number"
                                        min="300"
                                        max="850"
                                        value={inputs.creditScore}
                                        onChange={(e) => setInputs({ ...inputs, creditScore: Math.min(850, Math.max(300, parseInt(e.target.value) || 300)) })}
                                        className="w-full px-3 py-2 border border-border bg-card rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Employment Status */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground" htmlFor="employment">Employment Status</label>
                                    <select
                                        id="employment"
                                        value={inputs.employment}
                                        onChange={(e) => setInputs({ ...inputs, employment: e.target.value })}
                                        className="w-full px-3 py-2 border border-border bg-card rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                        required
                                    >
                                        <option value="Employed">Employed</option>
                                        <option value="Self-Employed">Self-Employed</option>
                                        <option value="Unemployed">Unemployed</option>
                                    </select>
                                </div>

                                {/* Requested Loan Amount */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground" htmlFor="loan">Loan Amount ($)</label>
                                    <input
                                        id="loan"
                                        type="number"
                                        value={inputs.loanAmount}
                                        onChange={(e) => setInputs({ ...inputs, loanAmount: Math.max(0, parseInt(e.target.value) || 0) })}
                                        className="w-full px-3 py-2 border border-border bg-card rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full font-semibold bg-primary hover:bg-opacity-95 text-primary-foreground text-sm cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        <span>Executing policies...</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-4 w-4" />
                                        <span>Execute Policy rules</span>
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Results Section */}
                    <div className="lg:col-span-7 border border-border bg-accent/10 dark:bg-accent/5 rounded-xl p-5 min-h-[350px] flex flex-col justify-center">
                        {error && (
                            <div className="text-center text-destructive py-4 text-xs font-semibold">
                                Error running evaluation: {error}
                            </div>
                        )}

                        {loading && (
                            <div className="space-y-4 py-8">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-24 w-full" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            </div>
                        )}

                        {!loading && !result && !error && (
                            <div className="text-center py-12 text-muted-foreground font-sans space-y-3">
                                <Code className="h-10 w-10 text-muted-foreground/60 mx-auto" />
                                <div>
                                    <p className="text-sm font-medium">Input configurations detected. Ready for evaluation.</p>
                                    <p className="text-xs text-muted-foreground mt-1">Click the primary action button to run the rules engine.</p>
                                </div>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {!loading && result && !error && (
                                <motion.div
                                    key={result.auditTrail}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    {/* Decision Banner */}
                                    <div className={`p-4 rounded-lg border flex items-center justify-between text-sm font-bold ${getDecisionStyles(result.decision).bg}`}>
                                        <div className="flex items-center gap-3">
                                            {getDecisionStyles(result.decision).icon}
                                            <div>
                                                <span className="block text-[10px] text-muted-foreground font-mono font-normal">RESOLUTION</span>
                                                <span className="text-md uppercase tracking-tight">{result.decision}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[10px] text-muted-foreground font-mono font-normal">LATENCY</span>
                                            <span className="font-mono text-xs font-medium text-foreground">{result.processingTimeMs} ms</span>
                                        </div>
                                    </div>

                                    {/* Execution Trace & Reasoning Logs */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Rules Evaluations checklist */}
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Rule Assertions</span>
                                            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                                                {result.matchedRules.map((rule) => (
                                                    <div
                                                        key={rule.ruleId}
                                                        className={`p-2 border rounded-lg flex items-start gap-2 bg-card text-xs ${rule.passed
                                                            ? 'border-emerald-500/10'
                                                            : 'border-destructive/10'
                                                            }`}
                                                    >
                                                        {rule.passed ? (
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                                        ) : (
                                                            <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                                                        )}
                                                        <div>
                                                            <strong className="text-foreground block">{rule.name}</strong>
                                                            <span className="text-[10px] text-muted-foreground leading-normal">{rule.details}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Step Reasoning list */}
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Logical Execution Trace</span>
                                            <div className="border border-border/60 bg-card/50 rounded-lg p-3 text-[11px] font-mono space-y-1.5 max-h-[180px] overflow-y-auto">
                                                {result.reasoning.map((step, idx) => (
                                                    <div key={idx} className="flex gap-1.5 items-start leading-normal text-muted-foreground">
                                                        <span className="text-indigo-400 font-semibold">{`>`}</span>
                                                        <span>{step}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Audit reference footer */}
                                    <div className="flex flex-col sm:flex-row justify-between items-center bg-card border border-border p-2.5 rounded-lg text-[10.5px] font-mono gap-2">
                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                            <Database className="h-3.5 w-3.5" />
                                            Trace: {result.auditTrail}
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded font-sans font-semibold bg-emerald-500/10 text-emerald-500 uppercase tracking-widest">
                                            Audit Lock Secured
                                        </span>
                                    </div>

                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
};
export default RulePlayground;
