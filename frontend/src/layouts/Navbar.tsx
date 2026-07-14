import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Cpu, Code2, LineChart, ChevronDown, Check } from 'lucide-react';
import { useRole, RoleType } from '../shared/context/RoleContext';
import { ThemeToggle } from '../shared/components/ThemeToggle';

export const Navbar: React.FC = () => {
    const { role, setRole, detectedRole } = useRole();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const location = useLocation();

    const rolesList: { id: RoleType; label: string; icon: React.ReactNode; color: string }[] = [
        { id: 'cro', label: 'Chief Risk Officer', icon: <ShieldAlert className="h-4 w-4" />, color: 'text-amber-500' },
        { id: 'cto', label: 'Chief Technology Officer', icon: <Cpu className="h-4 w-4" />, color: 'text-blue-500' },
        { id: 'engineer', label: 'Lead Engineer', icon: <Code2 className="h-4 w-4" />, color: 'text-emerald-500' },
        { id: 'investor', label: 'Financial Investor', icon: <LineChart className="h-4 w-4" />, color: 'text-violet-500' },
    ];

    const activeRoleConfig = rolesList.find((r) => r.id === role);

    const navLinks = [
        { path: '/', label: 'Landing' },
        { path: '/experience', label: 'Adaptive Experience' },
        { path: '/about', label: 'About GroundSet' },
        { path: '/architecture', label: 'System Design' },
        { path: '/prototype-explanation', label: 'Doc Check' },
    ];

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

                {/* Brand/Logo */}
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight font-sans">
                        <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm tracking-wide">
                            GS
                        </div>
                        <span>GroundSet</span>
                    </Link>

                    {/* Main Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`text-sm font-medium transition-colors hover:text-foreground ${isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-4">
                    {/* Suggested Role Alert */}
                    {detectedRole && detectedRole !== role && (
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-accent border border-border rounded-full text-xs text-muted-foreground transition-all duration-300">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                            <span>Suggested role: <strong>{rolesList.find(r => r.id === detectedRole)?.label}</strong></span>
                            <button
                                onClick={() => setRole(detectedRole)}
                                className="underline text-indigo-500 hover:text-indigo-600 font-semibold cursor-pointer ml-1"
                            >
                                Switch
                            </button>
                        </div>
                    )}

                    {/* Active Role Selector Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2.5 px-3.5 py-2 border border-border bg-card hover:bg-accent rounded-lg text-sm transition-all duration-200 select-none cursor-pointer focus:ring-2 focus:ring-ring"
                        >
                            {activeRoleConfig?.icon}
                            <span className="hidden sm:inline font-sans font-medium text-foreground">
                                {activeRoleConfig?.label}
                            </span>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </button>

                        {dropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-30"
                                    onClick={() => setDropdownOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-lg z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b border-border mb-1">
                                        Select Your Persona
                                    </div>
                                    {rolesList.map((r) => {
                                        const isSelected = r.id === role;
                                        return (
                                            <button
                                                key={r.id}
                                                onClick={() => {
                                                    setRole(r.id);
                                                    setDropdownOpen(false);
                                                }}
                                                className={`flex items-center justify-between w-full px-2 py-2 rounded-lg text-sm text-left transition-colors duration-150 cursor-pointer ${isSelected
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'hover:bg-accent text-foreground'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className={isSelected ? 'text-primary-foreground' : r.color}>
                                                        {r.icon}
                                                    </span>
                                                    <span className="font-medium">{r.label}</span>
                                                </div>
                                                {isSelected && <Check className="h-4 w-4" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    <ThemeToggle />
                </div>
            </div>

            {/* Mobile Nav Links */}
            <div className="md:hidden flex items-center justify-center border-t border-border py-2.5 bg-accent/30 overflow-x-auto gap-4">
                {navLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`text-xs font-medium transition-colors hover:text-foreground shrink-0 ${isActive ? 'text-foreground font-semibold border-b border-primary' : 'text-muted-foreground'
                                }`}
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </div>
        </header>
    );
};
