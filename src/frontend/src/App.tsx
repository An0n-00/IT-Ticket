import Main from '@/pages/Main/Main.tsx';
import LoginPage from '@/pages/Login/LoginPage.tsx';
import RegisterPage from '@/pages/Register/RegisterPage.tsx';
import DashboardPage from '@/pages/Dashboard/DashboardPage.tsx';
import NotFound from '@/pages/404/NotFound.tsx';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner.tsx';
import { AuthProvider } from '@/contexts/auth-context';
import ProtectedRoute from '@/components/auth/protected-route';

export default function App() {
    return (
        <>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        {/* Public routes that redirect to dashboard if authenticated */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute requireAuth={false}>
                                    <Main />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/login"
                            element={
                                <ProtectedRoute requireAuth={false}>
                                    <LoginPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <ProtectedRoute requireAuth={false}>
                                    <RegisterPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected routes that require authentication */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* 404 that redirects to dashboard if authenticated */}
                        <Route
                            path="*"
                            element={
                                <ProtectedRoute requireAuth={false}>
                                    <NotFound />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
            <Toaster closeButton richColors visibleToasts={5} />
        </>
    );
}
