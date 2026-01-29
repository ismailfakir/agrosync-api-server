import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/server.ts', // Path to your express app entry
      exportName: 'viteNodeApp', 
      tsCompiler: 'esbuild',
    }),
  ],
  optimizeDeps: {
    // Vite sometimes struggles with Mongoose's dynamic requires
    exclude: ['mongoose'],
  },
});