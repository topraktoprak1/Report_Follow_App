import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5174',
                changeOrigin: true,
            },
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('ag-grid')) {
                            return 'ag-grid';
                        }
                        if (id.includes('recharts')) {
                            return 'recharts';
                        }
                        if (id.includes('lucide')) {
                            return 'lucide';
                        }
                        return 'vendor';
                    }
                }
            }
        }
    }
});
