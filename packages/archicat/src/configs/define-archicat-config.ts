import type {
  AppsConfigInput,
  ArchicatConfig,
  ArchicatConfigInput,
  LibrariesConfigInput,
  ModulesConfigInput,
  TsConfigInput,
  TypeScriptConfigInput,
} from './archicat-config';
import { compactConfig } from './compact-config';

/**
 * @description Defines the root Archicat config.
 */
export function defineArchicatConfig(config: ArchicatConfigInput = {}): ArchicatConfig {
  return compactConfig({
    root: config.root,
    outDir: config.outDir,
    typescript: config.typescript ? freezeTypeScriptConfig(config.typescript) : undefined,
    alias: config.alias ? Object.freeze({ ...config.alias }) : undefined,
    modules: config.modules ? freezeModulesConfig(config.modules) : undefined,
    libraries: config.libraries ? freezeLibrariesConfig(config.libraries) : undefined,
    apps: config.apps ? freezeAppsConfig(config.apps) : undefined,
  });
}

// MARK: - Config freezing

function freezeTypeScriptConfig(config: TypeScriptConfigInput): NonNullable<ArchicatConfig['typescript']> {
  return compactConfig({
    tsConfig: config.tsConfig ? freezeTsConfig(config.tsConfig) : undefined,
  });
}

function freezeTsConfig(config: TsConfigInput): NonNullable<NonNullable<ArchicatConfig['typescript']>['tsConfig']> {
  return compactConfig({
    extends: config.extends,
    include: config.include ? Object.freeze([...config.include]) : undefined,
    exclude: config.exclude ? Object.freeze([...config.exclude]) : undefined,
    files: config.files ? Object.freeze([...config.files]) : undefined,
    compilerOptions: config.compilerOptions ? Object.freeze({ ...config.compilerOptions }) : undefined,
  });
}

function freezeModulesConfig(config: ModulesConfigInput): NonNullable<ArchicatConfig['modules']> {
  return compactConfig({
    include: config.include ? Object.freeze([...config.include]) : undefined,
    alias: config.alias,
  });
}

function freezeLibrariesConfig(config: LibrariesConfigInput): NonNullable<ArchicatConfig['libraries']> {
  return compactConfig({
    include: config.include ? Object.freeze([...config.include]) : undefined,
    alias: config.alias,
  });
}

function freezeAppsConfig(config: AppsConfigInput): NonNullable<ArchicatConfig['apps']> {
  return compactConfig({
    include: config.include ? Object.freeze([...config.include]) : undefined,
  });
}
