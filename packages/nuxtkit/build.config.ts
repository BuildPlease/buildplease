import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  externals: ['#imports'],
  rollup: {
    inlineDependencies: ['@buildplease/identity'],
  },
  hooks: {
    'build:prepare'(ctx) {
      ctx.options.entries ||= [];

      // MARK: - Public folder
      ctx.options.entries.push({
        input: 'src/public/index',
        builder: 'rollup',
        outDir: `${ctx.options.outDir}/public`,
      });

      // MARK: - Internal-Shared folder
      ctx.options.entries.push({
        input: 'src/internal-shared/index',
        builder: 'rollup',
        outDir: `${ctx.options.outDir}/internal-shared`,
      });

      // MARK: - Internal-Runtime folder
      ctx.options.entries.push({
        input: 'src/internal-runtime/index',
        builder: 'rollup',
        outDir: `${ctx.options.outDir}/internal-runtime`,
      });
    },
  },
});
