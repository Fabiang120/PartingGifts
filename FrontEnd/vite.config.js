import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      include: '**/*.{js,jsx,ts,tsx}',
    }),
  ],
  // vite.config.js
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'FrontEnd'),  
    },
  },
  
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    jsxInject: `import React from 'react'`,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
    transformMode: {
      web: ['.jsx', '.js', '.mjs'],
    },
  },
});
