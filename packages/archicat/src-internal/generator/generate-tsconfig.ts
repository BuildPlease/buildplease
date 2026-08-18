import path from 'node:path';

import { ArchicatDefaults } from '@src-internal/configuration/archicat-defaults';
import { writeJsonFile } from '@src-internal/generator/file-writer';
import type { ResolvedArchicatProject } from '@src-internal/model';
import { normalizePath } from '@src-internal/path';
import { readTsconfigCompilerOptions, readTsconfigExtendsPaths, readTsconfigFile } from '@src-internal/tsconfig';

// MARK: - TSConfig generation

interface GeneratedTsconfig {
  extends?: string;
  compilerOptions: {
    paths: Record<string, string[]>;
  };
  include: string[];
  exclude?: string[];
  files?: string[];
}

export function generateTsconfig(project: ResolvedArchicatProject): void {
  assertSupportedBaseTsconfigChain(project.tsconfigPath);
  writeJsonFile(path.join(project.outDir, ArchicatDefaults.generated.tsconfigFileName), makeGeneratedTsconfig(project));
}

// MARK: - TSConfig model

function makeGeneratedTsconfig(project: ResolvedArchicatProject): GeneratedTsconfig {
  const tsconfig: GeneratedTsconfig = {
    compilerOptions: makeCompilerOptions(project),
    include: makeInclude(project),
  };

  const extendedTsconfig = makeExtends(project);
  const exclude = makeExclude(project);
  const files = makeFiles(project);

  if (extendedTsconfig) {
    tsconfig.extends = extendedTsconfig;
  }

  if (exclude.length > 0) {
    tsconfig.exclude = exclude;
  }

  if (files.length > 0) {
    tsconfig.files = files;
  }

  return tsconfig;
}

function makeCompilerOptions(project: ResolvedArchicatProject): GeneratedTsconfig['compilerOptions'] {
  const userAliasPaths = makeConfiguredAliasPaths(project);
  const archicatPaths = makeArchicatAliasPaths(project);

  assertNoAliasConflicts(project, userAliasPaths, archicatPaths);

  return {
    paths: {
      ...userAliasPaths,
      ...archicatPaths,
    },
  };
}

function makeExtends(project: ResolvedArchicatProject): string | undefined {
  return project.tsconfigPath ? makeRelativeTsconfigPath(project.outDir, project.tsconfigPath) : undefined;
}

function makeInclude(project: ResolvedArchicatProject): string[] {
  return unique([
    ...rewriteProjectPaths(project, project.config.typescript.tsConfig.include),
    ArchicatDefaults.generated.typesInclude,
  ]);
}

function makeExclude(project: ResolvedArchicatProject): string[] {
  return rewriteProjectPaths(project, project.config.typescript.tsConfig.exclude);
}

function makeFiles(project: ResolvedArchicatProject): string[] {
  return rewriteProjectPaths(project, project.config.typescript.tsConfig.files);
}

// MARK: - Alias paths

function makeArchicatAliasPaths(project: ResolvedArchicatProject): Record<string, string[]> {
  const paths: Record<string, string[]> = {};

  for (const definition of project.definitions) {
    if (definition.api.rootPath) {
      paths[definition.aliasGlob] = [makeRelativeTsconfigPath(project.outDir, path.join(definition.api.rootPath, '*'))];
    }

    if (definition.impl.rootPath) {
      paths[definition.implAliasGlob] = [
        makeRelativeTsconfigPath(project.outDir, path.join(definition.impl.rootPath, '*')),
      ];
    }
  }

  return paths;
}

function makeConfiguredAliasPaths(project: ResolvedArchicatProject): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const [alias, target] of Object.entries(project.config.alias)) {
    const absolute = path.isAbsolute(target) ? target : path.resolve(project.rootDir, target);
    result[alias] = [makeRelativeTsconfigPath(project.outDir, absolute)];
  }

  return result;
}

// MARK: - Path rewriting

function rewriteProjectPaths(project: ResolvedArchicatProject, values: readonly string[]): string[] {
  return values.map((value) => {
    const absolute = path.isAbsolute(value) ? value : path.resolve(project.rootDir, value);
    return makeRelativeTsconfigPath(project.outDir, absolute);
  });
}

function makeRelativeTsconfigPath(fromDir: string, targetPath: string): string {
  let relative = normalizePath(path.relative(fromDir, targetPath));

  if (!relative.startsWith('.')) {
    relative = `./${relative}`;
  }

  return relative;
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

// MARK: - Base TSConfig validation

function assertSupportedBaseTsconfigChain(tsconfigPath: string | undefined): void {
  if (!tsconfigPath) {
    return;
  }

  validateBaseTsconfig(tsconfigPath, new Set(), new Set());
}

function validateBaseTsconfig(tsconfigPath: string, visiting: Set<string>, visited: Set<string>): void {
  const resolvedPath = path.resolve(tsconfigPath);

  if (visited.has(resolvedPath)) {
    return;
  }

  if (visiting.has(resolvedPath)) {
    throw new Error(`Circular tsconfig extends chain detected: ${resolvedPath}`);
  }

  visiting.add(resolvedPath);

  const config = readTsconfigFile(resolvedPath);
  const compilerOptions = readTsconfigCompilerOptions(config, resolvedPath);

  assertNoBaseTsconfigPaths(compilerOptions, resolvedPath);
  assertNoBaseTsconfigBaseUrl(compilerOptions, resolvedPath);

  for (const extendedPath of readTsconfigExtendsPaths(config, resolvedPath)) {
    validateBaseTsconfig(extendedPath, visiting, visited);
  }

  visiting.delete(resolvedPath);
  visited.add(resolvedPath);
}

function assertNoBaseTsconfigPaths(compilerOptions: Record<string, unknown>, tsconfigPath: string): void {
  if (Object.hasOwn(compilerOptions, 'paths')) {
    throw new Error(
      `Base tsconfig compilerOptions.paths is not supported by Archicat. Move aliases into archicat.config.ts alias: ${tsconfigPath}`,
    );
  }
}

function assertNoBaseTsconfigBaseUrl(compilerOptions: Record<string, unknown>, tsconfigPath: string): void {
  if (Object.hasOwn(compilerOptions, 'baseUrl')) {
    throw new Error(
      `Base tsconfig compilerOptions.baseUrl is not supported by Archicat. Move aliases into archicat.config.ts alias: ${tsconfigPath}`,
    );
  }
}

// MARK: - Alias validation

function assertNoAliasConflicts(
  project: ResolvedArchicatProject,
  userAliases: Record<string, string[]>,
  archicatPaths: Record<string, string[]>,
): void {
  const configuredAliases = Object.keys(userAliases);
  const archicatAliases = Object.keys(archicatPaths);
  const reservedAliases = [project.config.modules.alias, project.config.libraries.alias];

  for (const alias of configuredAliases) {
    if (archicatAliases.includes(alias)) {
      throw new Error(`Alias conflict: archicat.config.ts alias already defines "${alias}", but Archicat needs it.`);
    }

    for (const reservedAlias of reservedAliases) {
      if (alias === reservedAlias || alias === `${reservedAlias}/*` || alias.startsWith(`${reservedAlias}/`)) {
        throw new Error(
          `Alias conflict: archicat.config.ts alias "${alias}" is inside Archicat reserved alias "${reservedAlias}". Remove the alias or configure another module/library alias.`,
        );
      }
    }
  }
}
