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
    // ホットリロードの設定
    hmr: {
      overlay: false // エラーオーバーレイを無効化
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {},
    sourcemap: true,
    // ソースマップの生成方法を指定
    cssSourceMap: true,
  }
});
