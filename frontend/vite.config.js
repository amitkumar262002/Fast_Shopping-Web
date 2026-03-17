import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
    base: '/Fast_Shopping-Web/',
    plugins: [react()],
    server: {
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
            "Cross-Origin-Embedder-Policy": "unsafe-none"
        }
    }
})
