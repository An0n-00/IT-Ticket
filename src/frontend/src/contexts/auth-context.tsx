import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { User, AuthProviderProps, AuthContextType, RegisterData } from '@/types/auth.ts';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
    const navigate = useNavigate();

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        navigate('/');
        toast.success('Logged out successfully');
    }, [navigate]);

    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                setToken(storedToken);
                setIsAuthenticated(true);
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
            setError(null);

            const userResponse = await fetch(`${BACKEND_URL}/api/user`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (!userResponse.ok) {
                const errorData = await userResponse.json();
                toast.error(errorData.message || 'Failed to fetch user id');
                throw new Error('Failed to fetch user id');
            }

            const userData = await userResponse.json();

            const userDetailsResponse = await fetch(`${BACKEND_URL}/api/user/${userData.id}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (!userDetailsResponse.ok) {
                throw new Error('Failed to fetch user details');
            }

            const userDetails = await userDetailsResponse.json();
            setUser(userDetails);
        } catch (error: Error | any) {
            console.error('Error fetching user data:', error);
            toast.error(error.message || 'Failed to fetch user data');
            setError('Failed to fetch user data');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Login function
    const login = async (username: string, password: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${BACKEND_URL}/auth/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message || 'Login failed');
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
            setError(error instanceof Error ? error.message : 'Login failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Register function
    const register = async (registerData: RegisterData) => {
        try {
            setLoading(true);
            setError(null);

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
            setError(error instanceof Error ? error.message : 'Registration failed');
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
        loading,
        error,
        BACKEND_URL,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
