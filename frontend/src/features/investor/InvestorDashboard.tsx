import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BarChart3, TrendingDown, Hourglass, Shield, Percent, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../shared/components/Card';
import { Skeleton } from '../../shared/components/Skeleton';

interface MetricDetail {
    value: string;
    sublabel: string;
    trend: 'up' | 'down' | 'static';
}

interface ROIComparison {
    category: string;
    before: string;
    after: string;
}

interface DashboardData {
    metrics: Record<string, MetricDetail>;
    comparisons: ROIComparison[];
}

export const InvestorDashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await axios.get('/api/dashboard');
                setData(res.data);
                setError(null);
            } catch (err: any) {
                setError('Failed to load investor metrics dashboard.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const getMetricIcon = (key: string) => {
        switch (key) {
            case 'manualReviewReduction':
                return <TrendingDown className="h-5 w-5 text-emerald-500" />;
            case 'decisionSpeed':
                return <Hourglass className="h-5 w-5 text-blue-500" />;
            case 'complianceReadiness':
                return <Shield className="h-5 w-5 text-indigo-500" />;
            case 'averageROI':
                return <Percent className="h-5 w-5 text-violet-500" />;
            default:
                return <BarChart3 className="h-5 w-5" />;
        }
    };

    const getTrendIcon = (trend: string) => {
        if (trend === 'up') return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
        if (trend === 'down') return <ArrowDownRight className="h-4 w-4 text-emerald-500" />;
        return null;
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="p-4">
                            <Skeleton className="h-4 w-2/3 mb-2" />
                            <Skeleton className="h-8 w-1/2" />
                        </Card>
                    ))}
                </div>
                <Card className="p-6">
                    <Skeleton className="h-6 w-1/4 mb-4" />
                    <Skeleton className="h-24 w-full" />
                </Card>
            </div>
        );
    }

    if (error || !data) {
        return (
            <Card className="w-full border-destructive/20 bg-destructive/5 text-destructive font-sans">
                <CardContent className="flex items-center gap-3 py-6 justify-center">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-medium text-sm">{error || 'Data empty.'}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8 font-sans">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {Object.entries(data.metrics).map(([key, metric]) => {
                    const title = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (str) => str.toUpperCase());

                    return (
                        <motion.div
                            key={key}
                            whileHover={{ y: -3 }}
                            className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-3">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
                                <span className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                                    {getMetricIcon(key)}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{metric.value}</span>
                                {getTrendIcon(metric.trend)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5">{metric.sublabel}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Comparisons and ROI */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ROI Comparison cards */}
                <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-md font-bold text-foreground">Operational Efficiencies (Before vs. After GroundSet)</h4>
                    <div className="space-y-4">
                        {data.comparisons.map((c) => (
                            <div key={c.category} className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                                <div className="bg-secondary/40 border-b border-border px-4 py-2 text-xs font-bold text-foreground uppercase tracking-wider">
                                    {c.category}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 border-t-0 divide-y md:divide-y-0 md:divide-x divide-border">
                                    <div className="p-4 bg-muted/10">
                                        <span className="inline-block px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/25 text-[10px] uppercase font-bold tracking-wider mb-2">Before GroundSet</span>
                                        <p className="text-xs text-muted-foreground leading-relaxed leading-5">{c.before}</p>
                                    </div>
                                    <div className="p-4 bg-emerald-500/5">
                                        <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 text-[10px] uppercase font-bold tracking-wider mb-2">With GroundSet</span>
                                        <p className="text-xs text-foreground font-semibold leading-relaxed leading-5">{c.after}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Investment Highlights */}
                <div className="space-y-4">
                    <h4 className="text-md font-bold text-foreground">Market & Scale Advantage</h4>
                    <Card className="bg-primary text-primary-foreground border-transparent h-fit overflow-hidden">
                        <CardHeader className="border-b border-primary-foreground/10">
                            <span className="text-[10px] uppercase font-mono tracking-widest text-primary-foreground/75 font-semibold">Traction Overview</span>
                            <CardTitle className="text-lg text-primary-foreground font-bold mt-1">Enterprise Expansion Vector</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 p-5 text-sm">
                            <div className="space-y-1">
                                <span className="text-[10px] text-primary-foreground/70 uppercase font-mono font-medium block">Total Addressable Market</span>
                                <span className="text-lg font-bold">$12.4B Regulatory Decisioning</span>
                            </div>
                            <div className="space-y-1 border-t border-primary-foreground/10 pt-3">
                                <span className="text-[10px] text-primary-foreground/70 uppercase font-mono font-medium block">Year-over-Year Growth</span>
                                <span className="text-lg font-bold">142% Scale Retention Rate</span>
                            </div>
                            <div className="space-y-1 border-t border-primary-foreground/10 pt-3">
                                <span className="text-[10px] text-primary-foreground/70 uppercase font-mono font-medium block">Strategic Positioning</span>
                                <p className="text-xs text-primary-foreground/80 leading-normal leading-4 mt-1">
                                    Unlike traditional LLMs which drift, hallucinate, and present black-boxes, GroundSet binds structured rule checks for full deterministic verification.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
export default InvestorDashboard;
