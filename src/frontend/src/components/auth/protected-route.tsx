import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth.ts';
import type { ProtectedRouteProps } from '@/types/auth.ts';
import apiService from '@/lib/api.ts';

/**
 * ProtectedRoute component that handles route protection based on authentication status and role
 * @param children - The component to render if conditions are met
 * @param requireAuth - If true, redirects to login if not authenticated. If false, redirects to dashboard if authenticated.
 * @param requireAdmin - If true, requires admin role to access the route
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAuth = true, requireAdmin = false }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [checkingAdmin, setCheckingAdmin] = useState(false);

    useEffect(() => {
        let ignore = false;
        const checkAdmin = async () => {
            if (requireAdmin && isAuthenticated) {
                setCheckingAdmin(true);
                try {
                    const userId = (await apiService.getCurrentUserId()).id;
                    const user = await apiService.getUser(userId);
                    const role = await apiService.getRole(user.roleId);
                    if (!ignore) setIsAdmin(role.isAdmin);
                } catch {
                    if (!ignore) setIsAdmin(false);
                } finally {
                    if (!ignore) setCheckingAdmin(false);
                }
            } else {
                setIsAdmin(null);
            }
        };
        checkAdmin();
        return () => {
            ignore = true;
        };
    }, [requireAdmin, isAuthenticated]);

    // If requireAuth is true and user is not authenticated, redirect to login
    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If requireAuth is false and user is authenticated, redirect to dashboard
    if (!requireAuth && isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    // If requireAdmin is true, check if user has admin role
    if (requireAdmin) {
        if (checkingAdmin || isAdmin === null) {
            return null;
        }
        if (!isAdmin) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    // Otherwise, render the children
    return <>{children}</>;
};

export default ProtectedRoute;
