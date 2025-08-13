import Main from '@/pages/Main/Main.tsx';
import LoginPage from '@/pages/Login/LoginPage.tsx';
import RegisterPage from '@/pages/Register/RegisterPage.tsx';
import DashboardPage from '@/pages/Dashboard/DashboardPage.tsx';
import IssuesPage from '@/pages/Issue/IssuesPage.tsx';
import IssueDetailPage from '@/pages/Issue/IssueDetailPage.tsx';
import AccountPage from '@/pages/Account/AccountPage.tsx';
import AdminPage from '@/pages/Admin/AdminPage.tsx';
import NotificationsPage from '@/pages/Notifications/NotificationsPage.tsx';
import AuditLogsPage from '@/pages/AuditLogs/AuditLogsPage.tsx';
import SettingsPage from '@/pages/Settings/SettingsPage.tsx';
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
                        <Route
                            path="/issues"
                            element={
                                <ProtectedRoute>
                                    <IssuesPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/issue/:id"
                            element={
                                <ProtectedRoute>
                                    <IssueDetailPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/account"
                            element={
                                <ProtectedRoute>
                                    <AccountPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/notifications"
                            element={
                                <ProtectedRoute>
                                    <NotificationsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <AdminPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/audit-logs"
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <AuditLogsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <SettingsPage />
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
