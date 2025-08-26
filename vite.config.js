import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react({
            include: "**/*.{jsx,js,ts,tsx}",
        }),
    ],
    // esbuild: {
    //     loader: { '.js': 'jsx' },
    //     include: /resources\/js\/.*\.(js|jsx)$/,
    //     exclude: []
    // },
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
                '.jsx': 'jsx',
            },
        },
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    }
});