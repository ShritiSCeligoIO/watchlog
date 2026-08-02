/// <reference types="vitest/config" />
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url))
);

export default defineConfig({
  // Match integrator-ui: app source lives under src/
  root: 'src',
  // Load .env from repo root (not src/) — same file as vitest.setup.ts
  envDir: projectRoot,
  // Expose TMDB_API_KEY to the browser bundle (fallback when VITE_TMDB_API_KEY unset)
  envPrefix: ['VITE_', 'TMDB_'],
  publicDir: '../public',
  plugins: [react()],
  build: {
    outDir: '../build',
    emptyOutDir: true,
  },
  test: {
    include: ['**/*.test.ts', '**/*.test.tsx'],
    setupFiles: ['../vitest.setup.ts'],
    environment: 'node',
  },
});
