/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const __dirname = import.meta.dirname;

function getVersionFromMd(): string {
  const versionMd = fs.readFileSync(path.resolve(__dirname, '..', 'VERSION.md'), 'utf8');
  const match = versionMd.match(/^## (v\d+\.\d+\.\d+)/m);
  return match ? match[1] : 'unknown';
}

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(getVersionFromMd()),
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@arc/pdf-viewer': path.resolve(__dirname, 'src/stubs/empty.ts'),
    },
  },
  test: {
    include: ['src/**/__tests__/**/*.test.ts'],
  },
});
