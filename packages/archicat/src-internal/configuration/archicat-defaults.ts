// MARK: - Default configuration

export const ArchicatDefaults = Object.freeze({
  packageName: '@buildplease/archicat',
  configFileName: 'archicat.config.ts',
  root: '.',
  outDir: '.archicat',
  alias: Object.freeze({}),
  definitions: Object.freeze({
    moduleFileName: 'archicat.module.ts',
    libraryFileName: 'archicat.library.ts',
    appFileName: 'archicat.app.ts',
  }),
  generated: Object.freeze({
    modulesDirName: 'modules',
    librariesDirName: 'libraries',
    typesDirName: 'types',
    reportsDirName: 'reports',
    buildReportFileName: 'build.report.json',
    graphReportFileName: 'graph.report.json',
    tsconfigFileName: 'tsconfig.json',
    typesInclude: './types/**/*.d.ts',
    ignoredDirectoryNames: Object.freeze(['node_modules', '.git', '.archicat', 'dist', 'build', 'coverage'] as const),
  }),
  typescript: Object.freeze({
    consumerTsconfigFileName: 'tsconfig.json',
    tsConfig: Object.freeze({
      include: Object.freeze([] as const),
      exclude: Object.freeze([] as const),
      files: Object.freeze([] as const),
    }),
  }),
  modules: Object.freeze({
    include: Object.freeze(['./src/modules'] as const),
    alias: '#modules',
  }),
  libraries: Object.freeze({
    include: Object.freeze([] as const),
    alias: '#library',
  }),
  apps: Object.freeze({
    include: Object.freeze([] as const),
  }),
});
