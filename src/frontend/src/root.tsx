import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from './components/ui/theme-provider.tsx';

createRoot(document.getElementById('root')!).render(
    <ThemeProvider defaultTheme="system" storageKey="theme">
        <App />
    </ThemeProvider>
);
