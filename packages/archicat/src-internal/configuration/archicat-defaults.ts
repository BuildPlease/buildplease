export const ArchicatDefaults = {
  packageName: '@buildplease/archicat',
  configFileName: 'archicat.config.ts',
  root: '.',
  outDir: '.archicat',
  alias: {},
  definitions: {
    moduleFileName: 'archicat.module.ts',
    libraryFileName: 'archicat.library.ts',
    appFileName: 'archicat.app.ts',
  },
  generated: {
    modulesDirName: 'modules',
    librariesDirName: 'libraries',
    typesDirName: 'types',
    reportsDirName: 'reports',
    buildReportFileName: 'build.report.json',
    graphReportFileName: 'graph.report.json',
    tsconfigFileName: 'tsconfig.json',
    typesInclude: './types/**/*.d.ts',
    ignoredDirectoryNames: ['node_modules', '.git', '.archicat', 'dist', 'build', 'coverage'],
  },
  typescript: {
    consumerTsconfigFileName: 'tsconfig.json',
    tsConfig: {
      include: [],
      exclude: [],
      files: [],
    },
  },
  modules: {
    include: ['./src/modules'],
    alias: '#modules',
  },
  libraries: {
    include: [],
    alias: '#library',
  },
  apps: {
    include: [],
  },
} as const;
