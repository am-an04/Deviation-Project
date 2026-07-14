import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
    return (
        <footer className="border-t border-border bg-card mt-auto font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Logo & Philosophy */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
                            <div className="h-7 w-7 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                                GS
                            </div>
                            <span>GroundSet by BPOptima</span>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            We build high-fidelity systems enabling deterministic, auditable, and transparent enterprise decisions. True compliance starts with explainable logs, not black-boxes.
                        </p>
                    </div>

                    {/* Links 1 */}
                    <div>
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">Product</h4>
                        <ul className="space-y-2.5">
                            <li>
                                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    About GroundSet
                                </Link>
                            </li>
                            <li>
                                <Link to="/architecture" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    System Design
                                </Link>
                            </li>
                            <li>
                                <Link to="/experience" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Role Simulator
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div>
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">Resources</h4>
                        <ul className="space-y-2.5">
                            <li>
                                <Link to="/prototype-explanation" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Technical Checklist
                                </Link>
                            </li>
                            <li>
                                <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    GitHub Repository
                                </a>
                            </li>
                            <li>
                                <span className="text-xs px-2 py-0.5 border border-emerald-500/25 bg-emerald-500/10 text-emerald-500 rounded font-mono">
                                    v1.0.0 Stable
                                </span>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-border mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} BPOptima Inc. All rights reserved. GroundSet is a registered trademark.</p>
                    <div className="flex gap-4">
                        <span className="hover:text-foreground cursor-pointer">Security Policy</span>
                        <span className="hover:text-foreground cursor-pointer">Audit Standards</span>
                        <span className="hover:text-foreground cursor-pointer">MIT License</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
