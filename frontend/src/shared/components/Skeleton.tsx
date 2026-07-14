import React from 'react';
import { clsx } from 'clsx';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    return (
        <div
            className={clsx(
                'animate-pulse rounded-md bg-muted/60 dark:bg-muted/40',
                className
            )}
            {...props}
        />
    );
};
