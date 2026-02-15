import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import dotenv from 'dotenv';

dotenv.config();
const PORT = +(process.env.PORT || 3000);// + sign convert it to Number

export default defineConfig({
  server: {
    port: PORT,
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