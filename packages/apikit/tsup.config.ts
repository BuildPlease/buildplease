import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli/index.ts',
  },
  minify: false,
  splitting: true,
  sourcemap: true,
  treeshake: true,
  clean: true,
  dts: true,
  format: ['esm'],
  target: 'esnext',
  outDir: 'dist',
  platform: 'neutral',
  esbuildOptions(options) {
    if (options.entryPoints?.['cli']) {
      options.splitting = false;
      options.bundle = true;
    }
  },
});
