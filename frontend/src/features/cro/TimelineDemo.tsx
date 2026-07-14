import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Pause, RotateCcw, ChevronRight, ChevronLeft,
    Eye, ShieldAlert, Cpu, CheckCircle2, Clock,
    FileText, Settings, Database, Info, Terminal,
    RefreshCw, ExternalLink, ArrowRightLeft, X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';

interface TimelineEvent {
    id: number;
    time: string;
    title: string;
    description: string;
    actor: string;
    status: string;
}

interface DecisionState {
    income: number;
    creditScore: number;
    employment: string;
    decision: string;
}

interface DecisionDiffData {
    before: DecisionState;
    after: DecisionState;
    changes: Array<{ field: string; before: string; after: string }>;
    rules: Array<{ id: string; status: string }>;
    reason: string;
}

export const TimelineDemo: React.FC = () => {
    // Playback State
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [playbackSpeed, setPlaybackSpeed] = useState<number>(1500); // Speed in ms
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Time Travel / Transition states
    const [isDiffMode, setIsDiffMode] = useState<boolean>(false);
    const [diffData, setDiffData] = useState<DecisionDiffData | null>(null);
    const [developerMode, setDeveloperMode] = useState<boolean>(false);

    // Expandable Fields
    const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({
        income: false,
        creditScore: false,
        employment: false
    });

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch Timeline Data
    const fetchTimeline = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/timeline');
            setTimeline(res.data);
            setError(null);
        } catch (err: any) {
            setError('Failed to fetch decision replay data from Server API.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch Diff Data
    const fetchDiffData = useCallback(async () => {
        try {
            const res = await axios.get('/api/decision-diff');
            setDiffData(res.data);
        } catch (err: any) {
            console.error('Failed to load decision diff data.', err);
        }
    }, []);

    useEffect(() => {
        fetchTimeline();
        fetchDiffData();
    }, [fetchTimeline, fetchDiffData]);

    // Next / Previous step controls
    const handleNext = useCallback(() => {
        setCurrentStepIndex((prev) => (prev < timeline.length - 1 ? prev + 1 : prev));
    }, [timeline.length]);

    const handlePrev = useCallback(() => {
        setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }, []);

    const handleReplayStatus = useCallback(() => {
        setCurrentStepIndex(0);
        setIsPlaying(true);
    }, []);

    // Auto-play timer
    useEffect(() => {
        if (isPlaying) {
            timerRef.current = setInterval(() => {
                setCurrentStepIndex((prev) => {
                    if (prev >= timeline.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, playbackSpeed);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying, playbackSpeed, timeline.length]);

    // Keyboard navigation & accessibility scrubbing
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    setIsPlaying((prev) => !prev);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    handleNext();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    handlePrev();
                    break;
                case 'Escape':
                    if (isDiffMode) {
                        e.preventDefault();
                        setIsDiffMode(false);
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev, isDiffMode]);

    // Helper: Get Icon based on Step
    const getStepIcon = (stepId: number, active: boolean) => {
        const styles = active ? 'text-primary' : 'text-muted-foreground';
        switch (stepId) {
            case 1: return <FileText className={`h-4.5 w-4.5 ${styles}`} />;
            case 2: return <Cpu className={`h-4.5 w-4.5 ${styles}`} />;
            case 3: return <Database className={`h-4.5 w-4.5 ${styles}`} />;
            case 4: return <Eye className={`h-4.5 w-4.5 ${styles}`} />;
            case 5: return <CheckCircle2 className={`h-4.5 w-4.5 ${styles}`} />;
            case 6: return <Settings className={`h-4.5 w-4.5 ${styles}`} />;
            default: return <Clock className={`h-4.5 w-4.5 ${styles}`} />;
        }
    };

    const jumpToStep = (stepId: number) => {
        setIsDiffMode(false);
        setCurrentStepIndex(stepId - 1);
    };

    if (loading) {
        return (
            <Card className="w-full font-sans border-border">
                <CardContent className="py-20 space-y-4 text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground">Connecting time-machine playback logs...</p>
                </CardContent>
            </Card>
        );
    }

    if (error || timeline.length === 0) {
        return (
            <Card className="w-full border-destructive/20 bg-destructive/5 text-destructive font-sans">
                <CardContent className="flex items-center gap-3 py-6 justify-center">
                    <ShieldAlert className="h-5 w-5" />
                    <p className="font-semibold text-sm">{error || "Timeline logs empty."}</p>
                </CardContent>
            </Card>
        );
    }

    const currentStep = timeline[currentStepIndex];

    return (
        <div className="space-y-6 w-full font-sans">

            {/* Upper Mode Banner / Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
                <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <span>Decision Intelligence Center</span>
                        <span className="font-mono text-xs px-2 py-0.5 border border-border rounded bg-muted/50 text-muted-foreground">
                            Audit Stream: DEC-948A2
                        </span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Use the Interactive Time Machine to scrub through rule logic, or compare decisions to audit changed outcomes.
                    </p>
                </div>
                <div className="flex items-center gap-2 self-stretch sm:self-center shrink-0">
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1.5 text-xs cursor-pointer font-medium"
                        onClick={() => setDeveloperMode(!developerMode)}
                        aria-label="Toggle developer mode logs"
                    >
                        <Terminal className="h-3.5 w-3.5" />
                        <span>Dev Mode</span>
                        <span className={`h-1.5 w-1.5 rounded-full ${developerMode ? 'bg-emerald-500' : 'bg-muted-foreground/35'}`} />
                    </Button>

                    {currentStepIndex === timeline.length - 1 && !isDiffMode && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Button
                                size="sm"
                                className="bg-primary text-primary-foreground hover:bg-opacity-90 font-bold cursor-pointer text-xs flex items-center gap-1.5 shadow-sm"
                                onClick={() => setIsDiffMode(true)}
                            >
                                <ArrowRightLeft className="h-3.5 w-3.5" />
                                <span>Compare Another Decision</span>
                            </Button>
                        </motion.div>
                    )}

                    {isDiffMode && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="font-medium cursor-pointer text-xs flex items-center gap-1.5"
                            onClick={() => setIsDiffMode(false)}
                        >
                            <X className="h-3.5 w-3.5" />
                            <span>Exit Diff View</span>
                        </Button>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {!isDiffMode ? (
                    /* Mode 1: Decision Replay (Time Machine) */
                    <motion.div
                        key="replay-mode"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >

                        {/* Timeline Scrub Slider Section */}
                        <Card className="border-border">
                            <CardContent className="p-6 space-y-6">

                                {/* Horizontal progress visualization */}
                                <div className="relative pt-6 pb-2">
                                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2 rounded-full" />
                                    <motion.div
                                        className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(currentStepIndex / (timeline.length - 1)) * 100}%` }}
                                        transition={{ ease: 'easeInOut', duration: 0.2 }}
                                    />

                                    <div className="relative flex justify-between">
                                        {timeline.map((event, idx) => {
                                            const isActive = idx <= currentStepIndex;
                                            const isCurrent = idx === currentStepIndex;
                                            return (
                                                <div key={event.id} className="flex flex-col items-center select-none">
                                                    <button
                                                        onClick={() => {
                                                            setCurrentStepIndex(idx);
                                                            setIsPlaying(false);
                                                        }}
                                                        className={`h-9 w-9 rounded-full border flex items-center justify-center cursor-pointer transition-all duration-200 z-10 ${isCurrent
                                                            ? 'bg-primary border-primary text-primary-foreground scale-110 shadow-md ring-2 ring-ring ring-offset-2'
                                                            : isActive
                                                                ? 'bg-accent/80 border-primary text-primary'
                                                                : 'bg-card border-border hover:bg-accent text-muted-foreground'
                                                            }`}
                                                        aria-label={`Jump to step ${event.id}: ${event.title}`}
                                                    >
                                                        {getStepIcon(event.id, isActive)}
                                                    </button>
                                                    <span className={`text-[10px] mt-2.5 font-mono font-semibold ${isCurrent ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                                                        {event.time}
                                                    </span>
                                                    <span className={`hidden sm:inline text-[9.5px] mt-1 font-semibold max-w-[80px] text-center truncate ${isCurrent ? 'text-foreground' : 'text-muted-foreground/80'}`}>
                                                        {event.title.split(' ')[0]}...
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Control Panel */}
                                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/60">
                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-8 w-8 cursor-pointer rounded-lg"
                                            onClick={handlePrev}
                                            disabled={currentStepIndex === 0}
                                            aria-label="Previous Step"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-8 w-8 cursor-pointer rounded-lg bg-primary hover:bg-opacity-90 hover:text-primary-foreground text-primary-foreground border-transparent"
                                            onClick={() => setIsPlaying(!isPlaying)}
                                            aria-label={isPlaying ? "Pause Playback" : "Start Replay"}
                                        >
                                            {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-8 w-8 cursor-pointer rounded-lg"
                                            onClick={handleNext}
                                            disabled={currentStepIndex === timeline.length - 1}
                                            aria-label="Next Step"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-8 w-8 cursor-pointer rounded-lg"
                                            onClick={handleReplayStatus}
                                            aria-label="Replay decision from start"
                                        >
                                            <RotateCcw className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="font-mono font-semibold bg-accent px-2 py-1 rounded">
                                            Step {currentStep.id} of {timeline.length}
                                        </span>
                                        <div className="flex items-center gap-1.5 border border-border rounded-lg px-2 py-0.5">
                                            <Clock className="h-3 w-3" />
                                            <select
                                                value={playbackSpeed}
                                                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                                                className="bg-transparent border-none text-[11px] font-medium text-foreground focus:outline-none cursor-pointer py-0.5"
                                                aria-label="Playback speed selection"
                                            >
                                                <option value={2500}>0.5x Speed</option>
                                                <option value={1500}>1.0x Speed</option>
                                                <option value={800}>2.0x Speed</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                            </CardContent>
                        </Card>

                        {/* Dashboard grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                            {/* LIVE CURRENT STATE CARD */}
                            <div className="lg:col-span-4 flex flex-col">
                                <Card className="border-border flex-1 flex flex-col">
                                    <CardHeader className="pb-3">
                                        <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-primary">Live Context</span>
                                        <CardTitle className="text-md flex items-center justify-between">
                                            <span>{currentStep.title}</span>
                                            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono uppercase font-bold">
                                                {currentStep.status}
                                            </span>
                                        </CardTitle>
                                        <CardDescription className="text-xs">{currentStep.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col justify-between space-y-4 pt-0">
                                        <div className="space-y-3 font-sans text-xs pt-2">
                                            <div className="flex justify-between py-1.5 border-b border-border/40">
                                                <span className="text-muted-foreground">Operating Actor:</span>
                                                <span className="font-bold text-foreground">{currentStep.actor}</span>
                                            </div>
                                            <div className="flex justify-between py-1.5 border-b border-border/40">
                                                <span className="text-muted-foreground">Execution Time:</span>
                                                <span className="font-mono text-foreground font-semibold">{currentStep.time} AM IST</span>
                                            </div>
                                            <div className="flex justify-between py-1.5 border-b border-border/40">
                                                <span className="text-muted-foreground">Document Extract:</span>
                                                <span className="font-bold text-foreground">
                                                    {currentStepIndex >= 0 ? "loan_application_882.pdf" : "Awaiting Ingest..."}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-1.5">
                                                <span className="text-muted-foreground">Risk Escalation:</span>
                                                <span className="font-bold text-foreground">
                                                    {currentStepIndex >= 3 ? "Bypass Needed (Manual Review)" : "None"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-primary/[2%] border border-primary/10 rounded-xl p-3.5 text-xs text-muted-foreground leading-relaxed leading-5">
                                            <p className="font-bold text-foreground mb-1 flex items-center gap-1.5">
                                                <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                                                Operation Note
                                            </p>
                                            {currentStepIndex === 0 && "System initialized and waiting for document multipart data upload."}
                                            {currentStepIndex === 1 && "Ingested customer PDF. Normalizing document layout structure into schema fields."}
                                            {currentStepIndex === 2 && "Finished parser extraction. Executing business rules matrix against parsed fields."}
                                            {currentStepIndex === 3 && "Credit score triggers escalation limits. Automated queue routed to Officer Sterling."}
                                            {currentStepIndex === 4 && "Risk officer inputs override approval notes. Transaction finalized for synchronous dispatch."}
                                            {currentStepIndex === 5 && "Decision outcome generated. Sealed cryptographic hash trace logged to core ledger."}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* EVIDENCE PANEL */}
                            <div className="lg:col-span-4 flex flex-col">
                                <Card className="border-border flex-1 flex flex-col">
                                    <CardHeader className="pb-3">
                                        <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-primary">Evidence Provenance</span>
                                        <CardTitle className="text-md">Extracted Structured Facts</CardTitle>
                                        <CardDescription className="text-xs">Extracted facts matched and normalized from source PDF.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 space-y-3 pt-0">
                                        {currentStepIndex >= 1 ? (
                                            <div className="space-y-2">
                                                {/* Income */}
                                                <div className="border border-border rounded-xl">
                                                    <button
                                                        onClick={() => setExpandedFields(prev => ({ ...prev, income: !prev.income }))}
                                                        className="w-full flex items-center justify-between p-3 text-left cursor-pointer hover:bg-accent/40"
                                                    >
                                                        <span className="text-xs font-semibold text-foreground">Annual Income</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono font-bold text-xs bg-accent px-2 py-0.5 rounded border border-border">₹82,000</span>
                                                            <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expandedFields.income ? 'rotate-90' : ''}`} />
                                                        </div>
                                                    </button>
                                                    <AnimatePresence>
                                                        {expandedFields.income && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden border-t border-border/40 bg-muted/20 text-[11px] p-3 text-muted-foreground font-mono space-y-1"
                                                            >
                                                                <div>Verification: Verified via Tax Form Form-16</div>
                                                                <div>Confidence: 99.4% OCR certainty</div>
                                                                <div>Bounding Polygon: [120, 480, 240, 500]</div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                {/* Credit Score */}
                                                <div className="border border-border rounded-xl">
                                                    <button
                                                        onClick={() => setExpandedFields(prev => ({ ...prev, creditScore: !prev.creditScore }))}
                                                        className="w-full flex items-center justify-between p-3 text-left cursor-pointer hover:bg-accent/40"
                                                    >
                                                        <span className="text-xs font-semibold text-foreground">Credit Score</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono font-bold text-xs bg-accent px-2 py-0.5 rounded border border-border">742</span>
                                                            <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expandedFields.creditScore ? 'rotate-90' : ''}`} />
                                                        </div>
                                                    </button>
                                                    <AnimatePresence>
                                                        {expandedFields.creditScore && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden border-t border-border/40 bg-muted/20 text-[11px] p-3 text-muted-foreground font-mono space-y-1"
                                                            >
                                                                <div>Agency Referral: CIBIL Financial Services</div>
                                                                <div>Report Date: 2026-07-14T09:30:00</div>
                                                                <div>Reference Key: CIBIL-A94B2</div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                {/* Employment status */}
                                                <div className="border border-border rounded-xl">
                                                    <button
                                                        onClick={() => setExpandedFields(prev => ({ ...prev, employment: !prev.employment }))}
                                                        className="w-full flex items-center justify-between p-3 text-left cursor-pointer hover:bg-accent/40"
                                                    >
                                                        <span className="text-xs font-semibold text-foreground">Employment Status</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono font-bold text-xs bg-accent px-2 py-0.5 rounded border border-border">Verified</span>
                                                            <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expandedFields.employment ? 'rotate-90' : ''}`} />
                                                        </div>
                                                    </button>
                                                    <AnimatePresence>
                                                        {expandedFields.employment && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden border-t border-border/40 bg-muted/20 text-[11px] p-3 text-muted-foreground font-mono space-y-1"
                                                            >
                                                                <div>Employer: Tech Mahindra Solutions</div>
                                                                <div>Role: Senior Tech Consultant</div>
                                                                <div>Verification Channel: EPFO Direct API</div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                {/* Visual identity confirmation checkboxes */}
                                                <div className="grid grid-cols-2 gap-2 pt-2 text-[10.5px]">
                                                    <div className="flex items-center gap-1.5 bg-accent/30 p-2 rounded-lg border border-border/80">
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                                        <span className="text-muted-foreground font-semibold">Identity ID Match</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-accent/30 p-2 rounded-lg border border-border/80">
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                                        <span className="text-muted-foreground font-semibold">Address Normal</span>
                                                    </div>
                                                </div>

                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col justify-center items-center py-10 text-center gap-2 text-muted-foreground">
                                                <FileText className="h-8 w-8 stroke-1 stroke-muted-foreground animate-pulse" />
                                                <p className="text-xs">Awaiting data extraction completion... (Advances in Step 2)</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* RULES PANEL */}
                            <div className="lg:col-span-4 flex flex-col">
                                <Card className="border-border flex-1 flex flex-col">
                                    <CardHeader className="pb-3">
                                        <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-primary">Rules Verification</span>
                                        <CardTitle className="text-md">Deterministic Assertions</CardTitle>
                                        <CardDescription className="text-xs">Logical rules executed to evaluate suitability.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 space-y-3 pt-0">
                                        {currentStepIndex >= 2 ? (
                                            <div className="space-y-2.5">

                                                <motion.div
                                                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-card shadow-sm"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 }}
                                                >
                                                    <div className="space-y-0.5">
                                                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                            Rule #18 Match
                                                        </span>
                                                        <span className="block text-[10.5px] text-muted-foreground">Income Threshold ( &gt; ₹50,000 )</span>
                                                    </div>
                                                    <span className="text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 px-2 py-0.5 rounded uppercase">
                                                        Passed
                                                    </span>
                                                </motion.div>

                                                <motion.div
                                                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-card shadow-sm"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                >
                                                    <div className="space-y-0.5">
                                                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                            Rule #22 Check
                                                        </span>
                                                        <span className="block text-[10.5px] text-muted-foreground">Credit Score ( &gt; 720 )</span>
                                                    </div>
                                                    <span className="text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 px-2 py-0.5 rounded uppercase">
                                                        Passed
                                                    </span>
                                                </motion.div>

                                                <motion.div
                                                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-card shadow-sm"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                >
                                                    <div className="space-y-0.5">
                                                        <span className="text-xs font-bold text-foreground">
                                                            Rule #41 Active
                                                        </span>
                                                        <span className="block text-[10.5px] text-muted-foreground">Employment Alignment</span>
                                                    </div>
                                                    <span className="text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 px-2 py-0.5 rounded uppercase">
                                                        Passed
                                                    </span>
                                                </motion.div>

                                                {currentStepIndex >= 3 && (
                                                    <motion.div
                                                        className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/[2%] text-[11px] leading-relaxed text-amber-600 dark:text-amber-400 flex gap-2"
                                                        initial={{ scale: 0.95, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                                                        <div>
                                                            <strong className="block font-bold">Policy Alert Triggers:</strong>
                                                            Credit references require human verify step due to low history years (3.5 years established). Assigning task override parameters.
                                                        </div>
                                                    </motion.div>
                                                )}

                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col justify-center items-center py-10 text-center gap-2 text-muted-foreground">
                                                <Cpu className="h-8 w-8 stroke-1 stroke-muted-foreground" />
                                                <p className="text-xs">Rules evaluation deferred... (Advances in Step 3)</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                        </div>

                        {/* AUDIT SUMMARY PANEL */}
                        <Card className="border-border">
                            <CardHeader className="pb-2">
                                <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-primary">Compliance Proof Log</span>
                                <CardTitle className="text-md">Sealed Ledger Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 pt-2">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans">
                                    <div className="bg-accent/30 border border-border/80 p-3 rounded-xl">
                                        <span className="block text-[10px] text-muted-foreground uppercase mb-0.5 font-semibold">Audit Record Signature</span>
                                        <span className="font-mono text-foreground font-bold font-semibold block truncate">sha256:d80b2a8d67c29e18b82ff63cf9c9e8a8b27</span>
                                    </div>
                                    <div className="bg-accent/30 border border-border/80 p-3 rounded-xl">
                                        <span className="block text-[10px] text-muted-foreground uppercase mb-0.5 font-semibold">Assigned Assurer</span>
                                        <span className="font-bold text-foreground block">
                                            {currentStepIndex >= 3 ? "Marcus Sterling (Compliance Officer)" : "Auto Ingestion Agent"}
                                        </span>
                                    </div>
                                    <div className="bg-accent/30 border border-border/80 p-3 rounded-xl">
                                        <span className="block text-[10px] text-muted-foreground uppercase mb-0.5 font-semibold">Validation Ledger Sync</span>
                                        <span className={`font-bold block ${currentStepIndex >= 5 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {currentStepIndex >= 5 ? "SUCCESS (SYNCED)" : "PENDING"}
                                        </span>
                                    </div>
                                    <div className="bg-accent/30 border border-border/80 p-3 rounded-xl">
                                        <span className="block text-[10px] text-muted-foreground uppercase mb-0.5 font-semibold">Underwriting Version</span>
                                        <span className="font-mono text-foreground font-bold block">v2.10.4-LOCKED</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </motion.div>
                ) : (
                    /* Mode 2: Decision Diff (Three-Column Difference) */
                    <motion.div
                        key="diff-mode"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >

                        {/* Diff Grid Overview */}
                        {diffData ? (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch font-sans">

                                {/* COLUMN 1: DECISION A */}
                                <div className="lg:col-span-4 flex flex-col">
                                    <Card className="border-border flex-1 border-opacity-70">
                                        <CardHeader className="border-b border-border/40 pb-4">
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-xs uppercase font-semibold text-muted-foreground">Decision Profile A</span>
                                                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono uppercase font-bold">
                                                    {diffData.before.decision}
                                                </span>
                                            </div>
                                            <CardTitle className="text-md mt-2">Original Profile</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 pt-6">

                                            <div className="space-y-3 text-xs">
                                                <div className="flex justify-between py-1.5 border-b border-border/30">
                                                    <span className="text-muted-foreground">Annual Income</span>
                                                    <span className="font-bold text-foreground">₹{diffData.before.income.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between py-1.5 border-b border-border/30 bg-emerald-500/[2%] p-2 rounded">
                                                    <span className="text-muted-foreground font-semibold">Credit Score</span>
                                                    <span className="font-mono font-bold text-foreground">{diffData.before.creditScore}</span>
                                                </div>
                                                <div className="flex justify-between py-1.5 border-b border-border/30">
                                                    <span className="text-muted-foreground">Employment St.</span>
                                                    <span className="font-bold text-foreground">{diffData.before.employment}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 pt-2">
                                                <span className="text-[10px] font-mono font-semibold uppercase text-muted-foreground block">Asserted Rules</span>
                                                <div className="p-2 border border-emerald-500/15 bg-emerald-500/[2%] rounded-lg flex items-center justify-between text-xs">
                                                    <span className="font-medium text-foreground">Rule #18 (Passed)</span>
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                </div>
                                                <div className="p-2 border border-emerald-500/15 bg-emerald-500/[2%] rounded-lg flex items-center justify-between text-xs">
                                                    <span className="font-medium text-foreground">Rule #22 (Passed)</span>
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                </div>
                                            </div>

                                        </CardContent>
                                    </Card>
                                </div>

                                {/* COLUMN 2: DIFFERENCE CENTER BAR */}
                                <div className="lg:col-span-4 flex flex-col">
                                    <Card className="border-primary/25 bg-accent/10 flex-1 flex flex-col justify-between">
                                        <CardHeader className="pb-3 border-b border-border/40">
                                            <span className="font-mono text-xs uppercase font-semibold text-primary block">Comparison Difference</span>
                                            <CardTitle className="text-md">Changed Parameters</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col justify-between p-6 space-y-6">

                                            <div className="space-y-4">
                                                {diffData.changes.map((change, idx) => (
                                                    <div key={idx} className="bg-card border border-border p-4 rounded-xl space-y-3 shadow-sm">
                                                        <span className="text-xs font-semibold text-muted-foreground uppercase block font-mono">{change.field} change</span>
                                                        <div className="flex items-center justify-between font-mono bg-accent/40 rounded p-2 text-xs">
                                                            <span className="text-emerald-500 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/15">
                                                                {change.before}
                                                            </span>
                                                            <span className="text-muted-foreground select-none">→</span>
                                                            <span className="text-destructive font-bold bg-destructive/5 px-2 py-0.5 rounded border border-destructive/15">
                                                                {change.after}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => jumpToStep(2)} // Jumps to step 2 (Evidence Extracted)
                                                            className="w-full text-[10.5px] flex items-center justify-center gap-1.5 font-bold text-primary hover:underline cursor-pointer border border-primary/20 hover:border-primary/40 py-1.5 px-3 rounded bg-accent/30 transition-colors"
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                            Inspect Evidence Stage
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Deterministic Explanation Box (No AI hallucination statements) */}
                                            <div className="p-4 bg-destructive/[2%] border border-destructive/15 rounded-xl space-y-2 text-xs select-none">
                                                <div className="flex items-center gap-1.5 text-destructive font-bold">
                                                    <ShieldAlert className="h-4 w-4" />
                                                    <span>Audit Explanation</span>
                                                </div>
                                                <p className="text-muted-foreground leading-relaxed leading-5">
                                                    Decision changed from Approved to Rejected because the applicant's Credit Score fell to <strong className="text-foreground">690</strong>. Rule #27 enforces a strict minimum credit score criteria threshold of <strong className="text-foreground">700</strong>. Consequently, approval conditions were not satisfied.
                                                </p>
                                            </div>

                                        </CardContent>
                                    </Card>
                                </div>

                                {/* COLUMN 3: DECISION B */}
                                <div className="lg:col-span-4 flex flex-col">
                                    <Card className="border-border flex-1 border-opacity-70 animate-in fade-in duration-200">
                                        <CardHeader className="border-b border-border/40 pb-4">
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-xs uppercase font-semibold text-muted-foreground">Decision Profile B</span>
                                                <span className="text-xs bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 rounded font-mono uppercase font-bold">
                                                    {diffData.after.decision}
                                                </span>
                                            </div>
                                            <CardTitle className="text-md mt-2">New Comparison Profile</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 pt-6">

                                            <div className="space-y-3 text-xs">
                                                <div className="flex justify-between py-1.5 border-b border-border/30">
                                                    <span className="text-muted-foreground">Annual Income</span>
                                                    <span className="font-bold text-foreground">₹{diffData.after.income.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between py-1.5 border-b border-border/30 bg-destructive/5 p-2 rounded">
                                                    <span className="text-muted-foreground font-semibold">Credit Score</span>
                                                    <span className="font-mono font-bold text-foreground">{diffData.after.creditScore}</span>
                                                </div>
                                                <div className="flex justify-between py-1.5 border-b border-border/30">
                                                    <span className="text-muted-foreground">Employment St.</span>
                                                    <span className="font-bold text-foreground">{diffData.after.employment}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 pt-2">
                                                <span className="text-[10px] font-mono font-semibold uppercase text-muted-foreground block">Asserted Rules</span>
                                                <div className="p-2 border border-emerald-500/15 bg-emerald-500/[2%] rounded-lg flex items-center justify-between text-xs">
                                                    <span className="font-medium text-foreground">Rule #18 (Passed)</span>
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                </div>
                                                <div className="p-2 border border-destructive/15 bg-destructive/5 rounded-lg flex items-center justify-between text-xs">
                                                    <span className="font-medium text-foreground font-semibold">Rule #27 (Failed)</span>
                                                    <button
                                                        onClick={() => jumpToStep(3)} // Jump to Step 3: Rules Triggered
                                                        className="text-xs text-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
                                                    >
                                                        <span>Inspect</span>
                                                        <ChevronRight className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>

                                        </CardContent>
                                    </Card>
                                </div>

                            </div>
                        ) : (
                            <Card>
                                <CardContent className="py-20 text-center text-xs text-muted-foreground">
                                    Failed to resolve decision comparison diff logs.
                                </CardContent>
                            </Card>
                        )}

                    </motion.div>
                )}
            </AnimatePresence>

            {/* DEVELOPER MODE JSON METRICS INSPECTOR */}
            <AnimatePresence>
                {developerMode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="border-border bg-slate-950 text-slate-100 font-mono text-[11px] p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                <span className="flex items-center gap-2 font-bold text-slate-300">
                                    <Terminal className="h-4 w-4 text-emerald-500" />
                                    <span>Developer Sandbox Inspector</span>
                                </span>
                                <span className="text-[10px] text-slate-400">Response time: 42ms | Code: 200 OK</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="block text-slate-400 text-[10px] uppercase font-bold">API Endpoint</span>
                                    <div className="bg-slate-900 border border-slate-850 p-2 rounded text-emerald-400 truncate">
                                        {!isDiffMode ? "GET http://127.0.0.1:8000/api/timeline" : "GET http://127.0.0.1:8000/api/decision-diff"}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="block text-slate-400 text-[10px] uppercase font-bold">Cryptographically Proven Hash</span>
                                    <div className="bg-slate-900 border border-slate-850 p-2 rounded text-slate-300 truncate">
                                        sha256:d80b2a8d67c29e18b82ff63cf9c9e8a8b27dd3ad6df825b8efccae57
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="block text-slate-400 text-[10px] uppercase font-bold">Raw JSON Node Representation</span>
                                <pre className="bg-slate-900 border border-slate-850 p-3.5 rounded max-h-56 overflow-y-auto text-slate-300 scrollbar-thin select-all">
                                    {JSON.stringify(
                                        !isDiffMode ? currentStep : diffData,
                                        null,
                                        2
                                    )}
                                </pre>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
export default TimelineDemo;
