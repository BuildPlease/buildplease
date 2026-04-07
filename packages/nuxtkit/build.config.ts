import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  externals: ['#imports'],
  rollup: {
    inlineDependencies: ['@meawkit/identity'],
  },
  hooks: {
    'build:prepare'(ctx) {
      ctx.options.entries ||= [];

      // MARK: - Shared folder
      ctx.options.entries.push({
        input: 'src/shared/index',
        builder: 'rollup',
        outDir: `${ctx.options.outDir}/shared`,
      });

      // MARK: - Runtime-Internal folder
      ctx.options.entries.push({
        input: 'src/runtime-internal/index',
        builder: 'rollup',
        outDir: `${ctx.options.outDir}/runtime-internal`,
      });
    },
  },
});
