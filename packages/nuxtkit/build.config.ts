import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  hooks: {
    'build:prepare'(ctx) {
      ctx.options.entries ||= [];

      // MARK: - Shared folder
      ctx.options.entries.push({
        input: 'src/shared/',
        outDir: `${ctx.options.outDir}/shared`,
        addRelativeDeclarationExtensions: true,
        ext: 'js' as const,
        pattern: [
          '**',
          '!**/*.stories.{js,cts,mts,ts,jsx,tsx}', // ignore storybook files
          '!**/*.{spec,test}.{js,cts,mts,ts,jsx,tsx}', // ignore tests
        ],
      });

      // MARK: - Internal folder
      ctx.options.entries.push({
        input: 'src/runtime-internal/',
        outDir: `${ctx.options.outDir}/runtime-internal`,
        addRelativeDeclarationExtensions: true,
        ext: 'js' as const,
        pattern: ['**', '!**/*.stories.{js,cts,mts,ts,jsx,tsx}', '!**/*.{spec,test}.{js,cts,mts,ts,jsx,tsx}'],
      });
    },
  },
});
