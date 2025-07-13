import { type ReactNode } from 'react';

export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (registerData: RegisterData) => Promise<void>;
    logout: () => void;
    loading: boolean;
    error: string | null;
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
