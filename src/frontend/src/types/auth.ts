import React, { type ReactNode } from 'react';
import type { Role } from './api';

export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
}

export interface AuthContextType {
    user: User | null;
    role: Role | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (registerData: RegisterData) => Promise<void>;
    logout: () => void;
    loading: boolean;
    BACKEND_URL: string;
}

export interface RegisterData {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
}

export interface AuthProviderProps {
    children: ReactNode;
}

export interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireAdmin?: boolean;
}
