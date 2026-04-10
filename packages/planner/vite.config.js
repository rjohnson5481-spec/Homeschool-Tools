import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  plugins: [react()],

  // Planner deploys at /planner — all asset paths are prefixed accordingly.
  base: '/planner/',

  build: {
    // Output lands in the repo-root dist/planner/ so Netlify can serve it
    // at /planner alongside the dashboard at /.
    // Note: packages/dashboard/vite.config.js will also need outDir: '../../dist'
    // before the first combined Netlify deploy.
    outDir: '../../dist/planner',
    emptyOutDir: true,
  },

  resolve: {
    alias: {
      // Resolves @homeschool/shared imports without requiring npm install.
      '@homeschool/shared': fileURLToPath(
        new URL('../shared/src', import.meta.url)
      ),
    },
  },
});
