import Main from '@/components/Main.tsx';
import LoginPage from '@/components/auth/LoginPage.tsx';
import NotFound from '@/pages/NotFound.tsx';
import { BrowserRouter } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
