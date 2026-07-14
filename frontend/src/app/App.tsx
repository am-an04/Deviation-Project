import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../shared/context/ThemeContext';
import { RoleProvider } from '../shared/context/RoleContext';
import { AppRoutes } from '../routes';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

export const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <RoleProvider>
                    <BrowserRouter>
                        <AppRoutes />
                    </BrowserRouter>
                </RoleProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
};
export default App;
