import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-router-dom',
      'lucide-react',
      'firebase/app',
      'firebase/auth',
      'gsap',
      'gsap/ScrollTrigger',
      'lenis',
    ],
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
