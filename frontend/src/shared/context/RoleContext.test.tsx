import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { RoleProvider, useRole } from './RoleContext';

vi.mock('axios');
const mockedAxios = axios as any;

const TestRoleComponent = () => {
    const { role, experience, loading } = useRole();
    if (loading) return <span data-testid="loading">loading</span>;
    return (
        <div>
            <span data-testid="role-value">{role}</span>
            <span data-testid="experience-headline">{experience?.hero.headline}</span>
        </div>
    );
};

describe('RoleContext - RoleProvider', () => {
    beforeEach(() => {
        sessionStorage.clear();
        vi.restoreAllMocks();
    });

    it('detects cro role via URL parameters and loads experience config', async () => {
        // Modify search params definition
        delete (window as any).location;
        window.location = new URL('http://localhost/?role=cro') as any;

        const mockResponse = {
            data: {
                title: 'Chief Risk Officer',
                focus: 'Compliance & Governance',
                hero: {
                    headline: 'Enterprise Risk Audit',
                    subheadline: 'Sub'
                },
                features: [],
                demoType: 'timeline',
                testimonial: { quote: 'Q', author: 'A', position: 'P' },
                cta: 'Click'
            }
        };

        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        render(
            <RoleProvider>
                <TestRoleComponent />
            </RoleProvider>
        );

        // Initial check
        expect(screen.getByTestId('loading')).toBeInTheDocument();

        // Verify response loads
        await waitFor(() => {
            expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        });

        expect(screen.getByTestId('role-value').textContent).toBe('cro');
        expect(screen.getByTestId('experience-headline').textContent).toBe('Enterprise Risk Audit');
        expect(mockedAxios.get).toHaveBeenCalledWith('/api/experience/cro');
    });

    it('fallbacks to cro if no query parameter or sessionStorage value is set', async () => {
        window.location = new URL('http://localhost/') as any;

        const mockResponse = {
            data: {
                title: 'Chief Risk Officer',
                focus: 'Compliance',
                hero: {
                    headline: 'Compliance Engine',
                    subheadline: 'Sub'
                },
                features: [],
                demoType: 'timeline',
                testimonial: { quote: 'Q', author: 'A', position: 'P' },
                cta: 'Click'
            }
        };

        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        render(
            <RoleProvider>
                <TestRoleComponent />
            </RoleProvider>
        );

        await waitFor(() => {
            expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        });

        expect(screen.getByTestId('role-value').textContent).toBe('cro');
    });
});
