import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import istanbul from 'vite-plugin-istanbul';

// Use environment variable to configure backend URL for testing
const backendPort = process.env.BACKEND_PORT || '3000';
const backendTarget = `http://localhost:${backendPort}`;
const vitePort = process.env.VITE_PORT ? parseInt(process.env.VITE_PORT, 10) : 5173;

export default defineConfig({
  plugins: [
    react(),
    // Instrument code for E2E coverage when E2E_COVERAGE is set
    process.env.E2E_COVERAGE === 'true' &&
      istanbul({
        include: 'src/**/*.{js,jsx}',
        exclude: ['node_modules', 'tests/', '**/*.spec.js', '**/*.test.js'],
        extension: ['.js', '.jsx'],
        requireEnv: false,
        forceBuildInstrument: true,
      }),
  ].filter(Boolean),
  server: {
    port: vitePort,
    host: true, // Listen on all network interfaces and accept any hostname
    strictPort: false,
    hmr: {
      clientPort: vitePort,
    },
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/uploads': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
});
