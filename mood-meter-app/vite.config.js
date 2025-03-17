import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      // カスタムプラグインでJSファイルをJSXとして扱う
      name: 'treat-js-as-jsx',
      transform(code, id) {
        if (id.endsWith('.js')) {
          return {
            code,
            map: null
          };
        }
      }
    },
  ],
  base: './',
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {}
  }
});