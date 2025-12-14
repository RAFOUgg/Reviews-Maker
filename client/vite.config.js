import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    // Base path - empty for root deployment via Nginx
    base: '/',
    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
                ws: true,
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        console.log('Sending Request:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log('Received Response:', proxyRes.statusCode, req.url);
                    });
                }
            },
            '/images': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    // React vendor chunk
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    // UI libraries chunk
                    'ui-vendor': ['framer-motion', 'lucide-react'],
                    // Export/PDF libraries chunk
                    'export-vendor': ['html-to-image', 'jspdf', 'jszip'],
                    // i18n chunk
                    'i18n-vendor': ['i18next', 'react-i18next'],
                    // State management chunk
                    'state-vendor': ['zustand']
                }
            }
        }
    }
})
