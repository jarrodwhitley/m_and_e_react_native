import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    root: './',
    server: {
        host: true,
        allowedHosts: true,
    },
    build: {
        outDir: './dist',
        emptyOutDir: true, // also necessary
        manifest: true,
        rollupOptions: {
            output: {
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash][extname]',
            },
        },
    },
    plugins: [vue()],
})
