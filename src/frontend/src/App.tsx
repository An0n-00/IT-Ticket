import Main from '@/pages/Main/Main.tsx';
import LoginPage from '@/pages/Login/LoginPage.tsx';
import RegisterPage from '@/pages/Register/RegisterPage.tsx';
import NotFound from '@/pages/404/NotFound.tsx';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner.tsx';

export default function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Main />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
            <Toaster />
        </>
    );
}
