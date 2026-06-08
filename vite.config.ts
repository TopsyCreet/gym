import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;
          const mapping: Record<string, string[]> = {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['framer-motion', 'lucide-react'],
            'state': ['zustand'],
            'supabase': ['@supabase/supabase-js'],
          };
          for (const [chunk, pkgs] of Object.entries(mapping)) {
            for (const pkg of pkgs) {
              if (id.includes(`node_modules/${pkg}`)) return chunk;
            }
          }
          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
