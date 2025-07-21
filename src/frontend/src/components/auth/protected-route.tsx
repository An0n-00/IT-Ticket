import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth.ts';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
}

/**
 * ProtectedRoute component that handles route protection based on authentication status
 * @param children - The component to render if conditions are met
 * @param requireAuth - If true, redirects to login if not authenticated. If false, redirects to dashboard if authenticated.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAuth = true }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    // If requireAuth is true and user is not authenticated, redirect to login
    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If requireAuth is false and user is authenticated, redirect to dashboard
    if (!requireAuth && isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    // Otherwise, render the children
    return <>{children}</>;
};

export default ProtectedRoute;
