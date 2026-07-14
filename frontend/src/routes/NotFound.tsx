import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../shared/components/Button';

export const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center text-center py-20 font-sans max-w-xl mx-auto space-y-6">
            <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
                <ShieldAlert className="h-8 w-8" />
            </div>

            <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight">404 - Page Out of Scope</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    The requested system route does not exist or has been retracted by safety policies. Check the URL parameters or return to the main dashboard.
                </p>
            </div>

            <Button onClick={() => navigate('/')} className="font-semibold gap-2 bg-primary hover:bg-opacity-95 text-primary-foreground cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
                <span>Return home</span>
            </Button>
        </div>
    );
};
export default NotFound;
