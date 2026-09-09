/// <reference types="vitest/config" />
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: 'src',
  envDir: projectRoot,
  envPrefix: ['TMDB_', 'OPEN_LIBRARY_'],
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
