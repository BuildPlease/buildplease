import fs from 'node:fs';
import path from 'node:path';

import { ArchicatDefaults } from '@src-internal/configuration/archicat-defaults';
import type { ResolvedArchicatProject } from '@src-internal/model';
import { normalizePath } from '@src-internal/path';
import { readTsconfigCompilerOptions, readTsconfigFile } from '@src-internal/tsconfig';

// MARK: - Doctor checks

export function doctorProject(project: ResolvedArchicatProject): string[] {
  return [...checkConsumerTsconfig(project), ...checkPhysicalOmissions(project)];
}

// MARK: - Consumer TSConfig checks

function checkConsumerTsconfig(project: ResolvedArchicatProject): string[] {
  const consumerTsconfig = makeConsumerTsconfigPath(project);

  if (!fs.existsSync(consumerTsconfig)) {
    return [`Consumer tsconfig was not found: ${consumerTsconfig}`];
  }

  const issues: string[] = [];
  const config = readConsumerTsconfig(consumerTsconfig, issues);

  if (!config) {
    return issues;
  }

  const compilerOptions = readConsumerCompilerOptions(config, consumerTsconfig, issues);

  if (!compilerOptions) {
    return issues;
  }

  pushInvalidExtendsIssue(issues, project, config);
  pushRootDirIssue(issues, compilerOptions);
  pushPathsIssue(issues, compilerOptions);
  pushBaseUrlIssue(issues, compilerOptions);
  pushOwnedCollectionIssue(issues, config);

  return issues;
}

function readConsumerTsconfig(tsconfigPath: string, issues: string[]): Record<string, unknown> | undefined {
  try {
    return readTsconfigFile(tsconfigPath);
  } catch (error) {
    issues.push(`Failed to parse consumer tsconfig: ${formatError(error)}`);
    return undefined;
  }
}

function readConsumerCompilerOptions(
  config: Record<string, unknown>,
  tsconfigPath: string,
  issues: string[],
): Record<string, unknown> | undefined {
  try {
    return readTsconfigCompilerOptions(config, tsconfigPath);
  } catch (error) {
    issues.push(formatError(error));
    return undefined;
  }
}

function pushInvalidExtendsIssue(
  issues: string[],
  project: ResolvedArchicatProject,
  config: Record<string, unknown>,
): void {
  const expectedExtends = makeExpectedConsumerExtends(project);

  if (config.extends === expectedExtends) {
    return;
  }

  issues.push(`Consumer tsconfig should extend ${expectedExtends} for generated Archicat aliases to work.`);
}

function pushRootDirIssue(issues: string[], compilerOptions: Record<string, unknown>): void {
  const rootDir = compilerOptions.rootDir;

  if (rootDir !== 'src' && rootDir !== './src') {
    return;
  }

  issues.push('compilerOptions.rootDir is set to src. Generated Archicat files live outside src and may break tsc.');
}

function pushPathsIssue(issues: string[], compilerOptions: Record<string, unknown>): void {
  if (!Object.hasOwn(compilerOptions, 'paths')) {
    return;
  }

  issues.push(
    'compilerOptions.paths should move to archicat.config.ts alias. Consumer tsconfig paths can override generated Archicat aliases.',
  );
}

function pushBaseUrlIssue(issues: string[], compilerOptions: Record<string, unknown>): void {
  if (!Object.hasOwn(compilerOptions, 'baseUrl')) {
    return;
  }

  issues.push('compilerOptions.baseUrl is not supported. Move aliases into archicat.config.ts alias.');
}

function pushOwnedCollectionIssue(issues: string[], config: Record<string, unknown>): void {
  if (config.include === undefined && config.exclude === undefined && config.files === undefined) {
    return;
  }

  issues.push(
    'Consumer tsconfig include/exclude/files should move to archicat.config.ts typescript.tsConfig so generated Archicat types stay included.',
  );
}

// MARK: - Physical definition checks

function checkPhysicalOmissions(project: ResolvedArchicatProject): string[] {
  const issues: string[] = [];

  for (const definition of project.definitions) {
    const apiPath = path.join(definition.definitionDir, 'api');
    const implPath = path.join(definition.definitionDir, 'impl');

    if (!definition.api.rootPath && fs.existsSync(apiPath)) {
      issues.push(
        `${capitalize(definition.kind)} "${definition.name}" has a physical api directory but its contract omits api.root. Archicat treats the public API as empty.`,
      );
    }

    if (!definition.impl.rootPath && fs.existsSync(implPath)) {
      issues.push(
        `${capitalize(definition.kind)} "${definition.name}" has a physical impl directory but its contract omits impl.root. Archicat treats the implementation as no-op.`,
      );
    }
  }

  return issues;
}

// MARK: - Paths

function makeConsumerTsconfigPath(project: ResolvedArchicatProject): string {
  return path.join(project.rootDir, ArchicatDefaults.typescript.consumerTsconfigFileName);
}

function makeGeneratedTsconfigPath(project: ResolvedArchicatProject): string {
  return path.join(project.outDir, ArchicatDefaults.generated.tsconfigFileName);
}

function makeExpectedConsumerExtends(project: ResolvedArchicatProject): string {
  let relative = normalizePath(path.relative(project.rootDir, makeGeneratedTsconfigPath(project)));

  if (!isRelativeSpecifier(relative)) {
    relative = `./${relative}`;
  }

  return relative;
}

function isRelativeSpecifier(value: string): boolean {
  return value.startsWith('./') || value.startsWith('../');
}

// MARK: - Formatting

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
