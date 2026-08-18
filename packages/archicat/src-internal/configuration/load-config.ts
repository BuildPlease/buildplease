import fs from 'node:fs';
import path from 'node:path';

import { ArchicatDefaults } from '@src-internal/configuration/archicat-defaults';
import type { LoadedArchicatConfig, ResolvedArchicatConfig } from '@src-internal/model';
import { resolveProjectTsconfig } from '@src-internal/tsconfig';
import { createJiti } from 'jiti';

import type { ArchicatConfig } from '@/configs';

// MARK: - Config loading

export async function loadArchicatConfig(
  cwd: string,
  configFileName: string = ArchicatDefaults.configFileName,
): Promise<LoadedArchicatConfig> {
  const configFilePath = path.resolve(cwd, configFileName);

  if (!fs.existsSync(configFilePath)) {
    throw new Error(`Archicat config was not found: ${configFilePath}`);
  }

  const config = await importDefault<ArchicatConfig>(configFilePath, cwd);
  assertArchicatConfig(config, configFilePath);

  const resolvedConfig = resolveConfig(config);
  assertDistinctReservedAliases(resolvedConfig.modules.alias, resolvedConfig.libraries.alias, configFilePath);
  const rootDir = path.resolve(cwd, resolvedConfig.root);
  const outDir = path.resolve(rootDir, resolvedConfig.outDir);
  const reportsDir = path.resolve(outDir, ArchicatDefaults.generated.reportsDirName);
  const tsconfigPath = resolveTsconfigPath(rootDir, resolvedConfig.typescript.tsConfig.extends);

  return {
    configFilePath: configFilePath,
    rootDir: rootDir,
    outDir: outDir,
    reportsDir: reportsDir,
    ...(tsconfigPath ? { tsconfigPath: tsconfigPath } : {}),
    resolvedConfig: resolvedConfig,
  };
}

// MARK: - Config import

async function importDefault<T>(filePath: string, rootDir: string): Promise<T> {
  const jiti = createJiti(rootDir, {
    interopDefault: true,
    extensions: ['.js', '.cjs', '.mjs', '.ts', '.cts', '.mts', '.json'],
  });

  const imported = await jiti.import(filePath, { default: true });
  return imported as T;
}

// MARK: - Config resolving

function resolveConfig(config: ArchicatConfig): ResolvedArchicatConfig {
  return {
    root: config.root ?? ArchicatDefaults.root,
    outDir: config.outDir ?? ArchicatDefaults.outDir,
    typescript: resolveTypeScriptConfig(config),
    alias: { ...ArchicatDefaults.alias, ...(config.alias ?? {}) },
    modules: resolveModulesConfig(config.modules),
    libraries: resolveLibrariesConfig(config.libraries),
    apps: resolveAppsConfig(config.apps),
  };
}

function resolveTypeScriptConfig(config: ArchicatConfig): ResolvedArchicatConfig['typescript'] {
  const tsConfig = config.typescript?.tsConfig;
  const defaults = ArchicatDefaults.typescript.tsConfig;
  const resolvedTsConfig: ResolvedArchicatConfig['typescript']['tsConfig'] = {
    include: [...(tsConfig?.include ?? defaults.include)],
    exclude: [...(tsConfig?.exclude ?? defaults.exclude)],
    files: [...(tsConfig?.files ?? defaults.files)],
  };

  if (tsConfig?.extends) {
    resolvedTsConfig.extends = tsConfig.extends;
  }

  return { tsConfig: resolvedTsConfig };
}

function resolveModulesConfig(config: ArchicatConfig['modules']): ResolvedArchicatConfig['modules'] {
  return {
    include: [...(config?.include ?? ArchicatDefaults.modules.include)],
    alias: config?.alias ?? ArchicatDefaults.modules.alias,
  };
}

function resolveLibrariesConfig(config: ArchicatConfig['libraries']): ResolvedArchicatConfig['libraries'] {
  return {
    include: [...(config?.include ?? ArchicatDefaults.libraries.include)],
    alias: config?.alias ?? ArchicatDefaults.libraries.alias,
  };
}

function resolveAppsConfig(config: ArchicatConfig['apps']): ResolvedArchicatConfig['apps'] {
  return {
    include: [...(config?.include ?? ArchicatDefaults.apps.include)],
  };
}

function resolveTsconfigPath(rootDir: string, configuredExtends: string | undefined): string | undefined {
  if (!configuredExtends) {
    return undefined;
  }

  return resolveProjectTsconfig(rootDir, configuredExtends);
}

// MARK: - Config validation

function assertArchicatConfig(input: unknown, filePath: string): asserts input is ArchicatConfig {
  if (input == null || typeof input !== 'object') {
    throw new Error(`Invalid Archicat config: ${filePath}`);
  }

  const config = input as Partial<ArchicatConfig>;

  assertOptionalNonEmptyString(config.root, 'root', filePath);
  assertOptionalNonEmptyString(config.outDir, 'outDir', filePath);
  assertOptionalObject(config.typescript, 'typescript', filePath);
  assertOptionalObject(config.modules, 'modules', filePath);
  assertOptionalObject(config.libraries, 'libraries', filePath);
  assertOptionalObject(config.apps, 'apps', filePath);
  assertOptionalTsConfig(config.typescript?.tsConfig, filePath);

  assertOptionalInclude(config.modules?.include, 'modules.include', filePath);
  assertOptionalInclude(config.libraries?.include, 'libraries.include', filePath);
  assertOptionalInclude(config.apps?.include, 'apps.include', filePath);
  assertOptionalImportAlias(config.modules?.alias, 'modules.alias', filePath);
  assertOptionalImportAlias(config.libraries?.alias, 'libraries.alias', filePath);
  assertOptionalAlias(config.alias, 'alias', filePath);
}

function assertOptionalTsConfig(value: unknown, filePath: string): void {
  if (value === undefined) {
    return;
  }

  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Archicat config typescript.tsConfig must be an object: ${filePath}`);
  }

  const config = value as Record<string, unknown>;

  assertOptionalNonEmptyString(config.extends, 'typescript.tsConfig.extends', filePath);
  assertOptionalInclude(config.include, 'typescript.tsConfig.include', filePath);
  assertOptionalInclude(config.exclude, 'typescript.tsConfig.exclude', filePath);
  assertOptionalInclude(config.files, 'typescript.tsConfig.files', filePath);
  assertNoUnsupportedCompilerOptions(config.compilerOptions, filePath);
}

function assertNoUnsupportedCompilerOptions(value: unknown, filePath: string): void {
  if (value === undefined) {
    return;
  }

  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Archicat config typescript.tsConfig.compilerOptions must be an object: ${filePath}`);
  }

  const compilerOptions = value as Record<string, unknown>;

  if (Object.hasOwn(compilerOptions, 'paths')) {
    throw new Error(
      'Archicat config typescript.tsConfig.compilerOptions.paths is not supported. Move aliases into archicat.config.ts alias.',
    );
  }

  if (Object.hasOwn(compilerOptions, 'baseUrl')) {
    throw new Error(
      'Archicat config typescript.tsConfig.compilerOptions.baseUrl is not supported. Move aliases into archicat.config.ts alias.',
    );
  }

  if (Object.keys(compilerOptions).length > 0) {
    throw new Error(
      'Archicat config typescript.tsConfig.compilerOptions is not supported. Put compiler options in the base or app tsconfig.',
    );
  }
}

function assertOptionalNonEmptyString(value: unknown, key: string, filePath: string): void {
  if (value !== undefined && (typeof value !== 'string' || value.trim() === '')) {
    throw new Error(`Archicat ${key} must be a non-empty string when defined: ${filePath}`);
  }
}

function assertOptionalInclude(value: unknown, key: string, filePath: string): void {
  if (
    value !== undefined &&
    (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string' || entry.trim() === ''))
  ) {
    throw new Error(`Archicat config ${key} must be an array of non-empty strings: ${filePath}`);
  }
}

function assertOptionalImportAlias(value: unknown, key: string, filePath: string): void {
  if (value === undefined) {
    return;
  }

  if (typeof value !== 'string' || value.trim() === '' || value.includes('*') || value.endsWith('/')) {
    throw new Error(`Archicat config ${key} must be a non-empty alias without wildcard or trailing slash: ${filePath}`);
  }
}

function assertOptionalAlias(value: unknown, key: string, filePath: string): void {
  if (value === undefined) {
    return;
  }

  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Archicat config ${key} must be an object of non-empty string aliases: ${filePath}`);
  }

  for (const [alias, target] of Object.entries(value)) {
    if (alias.trim() === '' || typeof target !== 'string' || target.trim() === '') {
      throw new Error(`Archicat config ${key} must contain non-empty string aliases: ${filePath}`);
    }
  }
}

function assertOptionalObject(value: unknown, key: string, filePath: string): void {
  if (value !== undefined && (value == null || typeof value !== 'object' || Array.isArray(value))) {
    throw new Error(`Archicat config ${key} must be an object: ${filePath}`);
  }
}

function assertDistinctReservedAliases(moduleAlias: string, libraryAlias: string, filePath: string): void {
  if (
    moduleAlias === libraryAlias ||
    moduleAlias.startsWith(`${libraryAlias}/`) ||
    libraryAlias.startsWith(`${moduleAlias}/`)
  ) {
    throw new Error(
      `Archicat module and library aliases must use separate roots: "${moduleAlias}" and "${libraryAlias}" (${filePath})`,
    );
  }
}
