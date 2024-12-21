import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts'],
  minify: false,
  splitting: true,
  sourcemap: true,
  treeshake: true,
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
  target: 'esnext',
  outDir: 'dist',
  platform: 'neutral',
});
