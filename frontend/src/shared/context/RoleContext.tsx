import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export type RoleType = 'cro' | 'cto' | 'engineer' | 'investor';

export interface HeroConfig {
    headline: string;
    subheadline: string;
}

export interface FeatureCard {
    title: string;
    description: string;
}

export interface TestimonialConfig {
    quote: string;
    author: string;
    position: string;
}

export interface ExperienceData {
    role: RoleType;
    title: string;
    focus: string;
    hero: HeroConfig;
    features: FeatureCard[];
    testimonial: TestimonialConfig;
    demoType: 'timeline' | 'architecture' | 'playground' | 'dashboard';
    cta: string;
}

interface RoleContextType {
    role: RoleType;
    setRole: (role: RoleType) => void;
    experience: ExperienceData | null;
    loading: boolean;
    error: string | null;
    detectedRole: RoleType | null;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [role, setRoleState] = useState<RoleType>(() => {
        // Session state or default parameter
        const stored = sessionStorage.getItem('user_role');
        if (stored === 'cro' || stored === 'cto' || stored === 'engineer' || stored === 'investor') {
            return stored as RoleType;
        }
        return 'cro'; // Default role
    });

    const [detectedRole, setDetectedRole] = useState<RoleType | null>(null);
    const [experience, setExperience] = useState<ExperienceData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Privacy-friendly role detection heuristic
    useEffect(() => {
        // heuristic 1: Query parameters (e.g. ?utm_role=cto)
        const params = new URLSearchParams(window.location.search);
        const utmRole = params.get('utm_role') || params.get('role');
        if (utmRole === 'cro' || utmRole === 'cto' || utmRole === 'engineer' || utmRole === 'investor') {
            const detect = utmRole as RoleType;
            setDetectedRole(detect);
            setRoleState(detect);
            sessionStorage.setItem('user_role', detect);
            return;
        }

        // heuristic 2: User Agent / Browser signals (mocking corporate/dev signals)
        const ua = navigator.userAgent.toLowerCase();
        const isDev = ua.includes('chrome-extension') || ua.includes('postman') || ua.includes('curl') || ua.includes('lighthouse');

        // WebGL / screen resolution signals: Risk teams frequently use high DPI,
        // engineers use custom developers consoles. We will mock a random heuristic
        // or refer to cookies/headers. Let's make a mock default suggestion:
        // If screen size matches atypical size, suggest investor, etc.
        const screenWidth = window.screen.width;
        if (isDev) {
            setDetectedRole('engineer');
        } else if (screenWidth > 2560) { // Large ultra-wide monitors
            setDetectedRole('investor');
        } else {
            setDetectedRole('cro'); // Safe corporate default
        }
    }, []);

    useEffect(() => {
        let active = true;
        const fetchExperience = async () => {
            setLoading(true);
            setError(null);
            try {
                // Base API URL
                const res = await axios.get(`/api/experience/${role}`);
                if (active) {
                    setExperience(res.data);
                    setError(null);
                }
            } catch (err: any) {
                if (active) {
                    setError(err.message || 'Failed to resolve server-driven role configuration.');
                    setExperience(null);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchExperience();
        sessionStorage.setItem('user_role', role);

        return () => {
            active = false;
        };
    }, [role]);

    const setRole = (newRole: RoleType) => {
        setRoleState(newRole);
    };

    return (
        <RoleContext.Provider value={{ role, setRole, experience, loading, error, detectedRole }}>
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error('useRole must be used within a RoleProvider');
    }
    return context;
};
