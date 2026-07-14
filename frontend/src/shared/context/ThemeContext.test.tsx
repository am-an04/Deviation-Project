import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

// Simple test helper component
const TestThemeComponent = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <div>
            <span data-testid="theme-value">{theme}</span>
            <button data-testid="toggle-button" onClick={toggleTheme}>
                Toggle
            </button>
        </div>
    );
};

describe('ThemeContext - ThemeProvider', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.className = '';
    });

    it('provides default light theme and sets HTML class', () => {
        render(
            <ThemeProvider>
                <TestThemeComponent />
            </ThemeProvider>
        );

        expect(screen.getByTestId('theme-value').textContent).toBe('light');
        expect(document.documentElement.className).toBe('light');
    });

    it('toggles theme correctly and updates HTML class', () => {
        render(
            <ThemeProvider>
                <TestThemeComponent />
            </ThemeProvider>
        );

        const button = screen.getByTestId('toggle-button');
        fireEvent.click(button);

        expect(screen.getByTestId('theme-value').textContent).toBe('dark');
        expect(document.documentElement.className).toBe('dark');

        fireEvent.click(button);
        expect(screen.getByTestId('theme-value').textContent).toBe('light');
        expect(document.documentElement.className).toBe('light');
    });

    it('persists theme selection in localStorage', () => {
        localStorage.setItem('theme', 'dark');

        render(
            <ThemeProvider>
                <TestThemeComponent />
            </ThemeProvider>
        );

        expect(screen.getByTestId('theme-value').textContent).toBe('dark');
        expect(document.documentElement.className).toBe('dark');
    });
});
