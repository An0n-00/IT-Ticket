import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import vitePluginSvgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss(), vitePluginSvgr()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        host: 'localhost',
        port: 3000,
        strictPort: true,
    },
});
