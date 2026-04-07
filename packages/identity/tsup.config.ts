import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { 'src/index': './src/index.ts' },
    tsconfig: 'tsconfig.json',
    platform: 'neutral',
    target: 'esnext',
    format: ['esm', 'cjs'],

    outDir: 'dist',
    clean: true,

    dts: true,
    minify: true,
    bundle: true,
    shims: false,
    sourcemap: false,
    splitting: false,
    treeshake: true,
  },
]);
