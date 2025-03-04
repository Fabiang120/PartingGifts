import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Ensure that the plugin processes both .js and .jsx files
      include: '**/*.{js,jsx,ts,tsx}',
    }),
  ],
  esbuild: {
    // Configure JSX transformation options (this is usually enough)
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
