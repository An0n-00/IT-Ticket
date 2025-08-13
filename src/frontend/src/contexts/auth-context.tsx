import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { AuthContextType, AuthProviderProps, RegisterData, User } from '@/types/auth.ts';
import type { Role } from '@/types/api.ts';
import apiService from '@/lib/api.ts';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
// eslint-disable-next-line react-refresh/only-export-components
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<Role | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
    const navigate = useNavigate();

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
        // Clear token from apiService as well
        apiService.setToken(null);
        navigate('/');
        toast.success('Logged out successfully');
    }, [navigate]);

    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                setToken(storedToken);
                setIsAuthenticated(true);
                // Set token in apiService
                apiService.setToken(storedToken);
                try {
                    await fetchUserData(storedToken);
                } catch {
                    logout();
                }
            }
        };

        checkAuth();
    }, [logout]);

    const fetchUserData = async (authToken: string) => {
        try {
            setLoading(true);
            setToken(authToken);
            // Set the token in apiService first
            apiService.setToken(authToken);
            setUser(await apiService.getUser((await apiService.getCurrentUserId()).id));
            setRole(await apiService.getRole((await apiService.getUser((await apiService.getCurrentUserId()).id)).roleId));

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
        } catch (error: Error) {
            console.error('Error fetching user data:', error);
            toast.error(error.message || 'Failed to fetch user data');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Login function
    const login = async (username: string, password: string) => {
        try {
            setLoading(true);

            const response = await fetch(`${BACKEND_URL}/auth/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();
            const { jwt: authToken } = data;

            // Save token to localStorage
            localStorage.setItem('token', authToken);
            setToken(authToken);
            setIsAuthenticated(true);

            // Fetch user data
            await fetchUserData(authToken);

            // Redirect to dashboard
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error instanceof Error ? error.message : 'Login failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Register function
    const register = async (registerData: RegisterData) => {
        try {
            setLoading(true);

            const response = await fetch(`${BACKEND_URL}/auth/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message || 'Login failed');
                throw new Error(errorData.message || 'Registration failed');
            }

            const data = await response.json();
            const { jwt: authToken } = data;

            localStorage.setItem('token', authToken);
            setToken(authToken);
            setIsAuthenticated(true);

            await fetchUserData(authToken);

            navigate('/dashboard');
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error instanceof Error ? error.message : 'Login failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        token,
        isAuthenticated,
        login,
        register,
        logout,
        role,
        loading,
        BACKEND_URL,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
