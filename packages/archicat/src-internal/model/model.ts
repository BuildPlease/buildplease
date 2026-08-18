import type { ArchicatAppContract, ArchicatConfig, ArchicatLibraryContract, ArchicatModuleContract } from '@/configs';

// MARK: - Configuration model

export interface ModulesConfig {
  readonly include: readonly string[];
  readonly alias: string;
}

export interface LibrariesConfig {
  readonly include: readonly string[];
  readonly alias: string;
}

export interface AppsConfig {
  readonly include: readonly string[];
}

export interface ResolvedArchicatConfig {
  readonly root: string;
  readonly outDir: string;
  readonly typescript: {
    readonly tsConfig: {
      extends?: string;
      readonly include: readonly string[];
      readonly exclude: readonly string[];
      readonly files: readonly string[];
    };
  };
  readonly alias: Readonly<Record<string, string>>;
  readonly modules: ModulesConfig;
  readonly libraries: LibrariesConfig;
  readonly apps: AppsConfig;
}

export interface LoadedArchicatConfig {
  configFilePath: string;
  rootDir: string;
  outDir: string;
  reportsDir: string;
  tsconfigPath?: string;
  config: ArchicatConfig;
  resolvedConfig: ResolvedArchicatConfig;
}

// MARK: - Loaded definition model

export interface LoadedArchicatModule {
  kind: 'module';
  contractFilePath: string;
  definitionDir: string;
  contract: ArchicatModuleContract;
}

export interface LoadedArchicatLibrary {
  kind: 'library';
  contractFilePath: string;
  definitionDir: string;
  contract: ArchicatLibraryContract;
}

export interface LoadedArchicatApp {
  kind: 'app';
  contractFilePath: string;
  definitionDir: string;
  contract: ArchicatAppContract;
}

export type LoadedArchicatDefinition = LoadedArchicatModule | LoadedArchicatLibrary | LoadedArchicatApp;

// MARK: - Dependency graph model

export type ArchicatDefinitionKind = 'module' | 'library' | 'app';
export type ArchicatTargetKind = 'module' | 'library';
export type ArchicatSurface = 'api' | 'impl';
export type ArchicatDependencyOrigin = 'declared' | 'derived';

export interface ArchicatGraphTarget {
  key: string;
  kind: ArchicatTargetKind;
  name: string;
  surface: ArchicatSurface;
}

export interface ArchicatGraphDependency {
  from: string;
  to: string;
  origin: ArchicatDependencyOrigin;
}

// MARK: - Resolved definition model

export interface ResolvedArchicatSurface {
  rootPath?: string;
  mirrorRootPath: string;
  dependencies: string[];
}

export interface ResolvedArchicatModule {
  kind: 'module';
  name: string;
  apiTarget: string;
  implTarget: string;
  alias: string;
  aliasGlob: string;
  implAlias?: string;
  implAliasGlob?: string;
  contractFilePath: string;
  definitionDir: string;
  api: ResolvedArchicatSurface;
  impl: ResolvedArchicatSurface;
}

export interface ResolvedArchicatLibrary {
  kind: 'library';
  name: string;
  apiTarget: string;
  implTarget: string;
  alias: string;
  aliasGlob: string;
  implAlias?: string;
  implAliasGlob?: string;
  contractFilePath: string;
  definitionDir: string;
  api: ResolvedArchicatSurface;
  impl: ResolvedArchicatSurface;
}

export interface ResolvedArchicatApp {
  kind: 'app';
  name: string;
  target: string;
  contractFilePath: string;
  definitionDir: string;
  rootPath: string;
  dependencies: string[];
}

export type ResolvedArchicatDefinition = ResolvedArchicatModule | ResolvedArchicatLibrary;

export interface ArchicatProjectGraph {
  targets: ArchicatGraphTarget[];
  dependencies: ArchicatGraphDependency[];
}

// MARK: - Resolved project model

export interface ResolvedArchicatProject {
  rootDir: string;
  outDir: string;
  reportsDir: string;
  tsconfigPath?: string;
  configFilePath: string;
  config: ResolvedArchicatConfig;
  modules: ResolvedArchicatModule[];
  libraries: ResolvedArchicatLibrary[];
  apps: ResolvedArchicatApp[];
  definitions: ResolvedArchicatDefinition[];
  graph: ArchicatProjectGraph;
}

// MARK: - Report model

export interface ArchicatBuildReport {
  generatedBy: 'archicat';
  schemaVersion: 2;
  aliases: {
    module: string;
    library: string;
  };
  outputs: {
    outDir: string;
    reportsDir: string;
  };
  targets: string[];
  definitions: Array<{
    kind: ArchicatDefinitionKind;
    name: string;
    targets: Record<string, string>;
    aliases: Record<string, string | undefined>;
    dependencies: Record<string, string[]> | string[];
    contractFilePath: string;
    source: Record<string, string | undefined>;
    mirror: Record<string, string | undefined>;
  }>;
  dependencies: ArchicatGraphDependency[];
}

export interface ArchicatGraphReport {
  generatedBy: 'archicat';
  schemaVersion: 1;
  targets: string[];
  dependencies: ArchicatGraphDependency[];
}

// MARK: - Diagnostics model

export interface ArchicatViolation {
  filePath: string;
  importPath: string;
  message: string;
}

export interface ArchicatDoctorIssue {
  severity: 'warning' | 'error';
  message: string;
}
