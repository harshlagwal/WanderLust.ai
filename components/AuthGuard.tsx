import React from 'react';

interface AuthGuardProps {
    user: any;
    loading: boolean;
    children: React.ReactNode;
    fallback: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ user, loading, children, fallback }) => {
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

export default AuthGuard;
