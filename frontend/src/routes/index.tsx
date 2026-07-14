import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../layouts/Layout';
import { Skeleton } from '../shared/components/Skeleton';

// Lazy load pages for code splitting & speed optimization
const Landing = lazy(() => import('./Landing'));
const AdaptiveExperience = lazy(() => import('./AdaptiveExperience'));
const About = lazy(() => import('./About'));
const SystemDesign = lazy(() => import('./SystemDesign'));
const PrototypeExplanation = lazy(() => import('./PrototypeExplanation'));
const NotFound = lazy(() => import('./NotFound'));

const PageLoader = () => (
    <div className="w-full space-y-6 py-12">
        <Skeleton className="h-12 w-3/4 max-w-lg mb-6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    </div>
);

export const AppRoutes: React.FC = () => {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Landing />} />
                    <Route path="experience" element={<AdaptiveExperience />} />
                    <Route path="about" element={<About />} />
                    <Route path="architecture" element={<SystemDesign />} />
                    <Route path="prototype-explanation" element={<PrototypeExplanation />} />
                    <Route path="404" element={<NotFound />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                </Route>
            </Routes>
        </Suspense>
    );
};
export default AppRoutes;
