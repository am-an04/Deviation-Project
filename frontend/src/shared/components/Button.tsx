import React from 'react';
import { clsx } from 'clsx';
import { PureComponent } from 'react'; // not needed, clean hook is standard
import { Slot } from '@radix-ui/react-slot';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
        const Component = asChild ? Slot : 'button';

        const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';

        const variants = {
            primary: 'bg-primary text-primary-foreground hover:bg-opacity-90 shadow-sm border border-transparent',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-opacity-80 shadow-sm border border-transparent',
            outline: 'bg-transparent border border-border text-foreground hover:bg-accent hover:text-accent-foreground',
            ghost: 'bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground',
            destructive: 'bg-destructive text-destructive-foreground hover:bg-opacity-90 shadow-sm border border-transparent',
        };

        const sizes = {
            sm: 'h-9 px-3 text-sm gap-1.5',
            md: 'h-10 px-4 text-base gap-2',
            lg: 'h-11 px-6 text-lg gap-2',
            icon: 'h-9 w-9 p-0',
        };

        return (
            <Component
                ref={ref}
                className={clsx(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';
