import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import istanbul from 'vite-plugin-istanbul';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const vitePort = process.env.VITE_PORT ? parseInt(process.env.VITE_PORT, 10) : 5173;

export default defineConfig({
  root: projectRoot,
  build: {
    rollupOptions: {
      input: './src/index.html',
    },
  },
  plugins: [
    react(),
    // Instrument code for E2E coverage when E2E_COVERAGE is set
    process.env.E2E_COVERAGE === 'true' &&
      istanbul({
        include: 'src/**/*.{js,jsx,ts,tsx}',
        exclude: [
          'node_modules',
          'tests/',
          '**/*.spec.js',
          '**/*.test.js',
          '**/*.spec.ts',
          '**/*.test.ts',
        ],
        extension: ['.js', '.jsx', '.ts', '.tsx'],
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
  },
});
