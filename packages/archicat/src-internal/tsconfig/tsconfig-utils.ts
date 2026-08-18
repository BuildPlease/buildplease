import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { ArchicatDefaults } from '@src-internal/configuration/archicat-defaults';
import ts from 'typescript';

// MARK: - TSConfig IO

export function readTsconfigFile(tsconfigPath: string): Record<string, unknown> {
  const raw = fs.readFileSync(tsconfigPath, 'utf8');
  const parsed = ts.parseConfigFileTextToJson(tsconfigPath, raw);

  if (parsed.error) {
    throw new Error(formatTsDiagnostic(parsed.error));
  }

  if (parsed.config == null || typeof parsed.config !== 'object' || Array.isArray(parsed.config)) {
    throw new Error(`Invalid tsconfig object: ${tsconfigPath}`);
  }

  return parsed.config as Record<string, unknown>;
}

export function readTsconfigCompilerOptions(
  tsconfig: Record<string, unknown>,
  source = 'tsconfig',
): Record<string, unknown> {
  const compilerOptions = tsconfig.compilerOptions;

  if (compilerOptions == null) {
    return {};
  }

  if (typeof compilerOptions !== 'object' || Array.isArray(compilerOptions)) {
    throw new Error(`Tsconfig compilerOptions must be an object: ${source}`);
  }

  return compilerOptions as Record<string, unknown>;
}

// MARK: - TSConfig extends

export function readTsconfigExtendsPaths(tsconfig: Record<string, unknown>, tsconfigPath: string): string[] {
  const extended = tsconfig.extends;

  if (extended === undefined) {
    return [];
  }

  if (typeof extended === 'string') {
    return [resolveTsconfigExtends(tsconfigPath, extended)];
  }

  if (Array.isArray(extended) && extended.every((entry) => typeof entry === 'string')) {
    return extended.map((entry) => resolveTsconfigExtends(tsconfigPath, entry));
  }

  throw new Error(`Tsconfig extends must be a string or string array: ${tsconfigPath}`);
}

export function resolveProjectTsconfig(rootDir: string, configuredExtends: string): string {
  if (path.isAbsolute(configuredExtends) || configuredExtends.startsWith('.')) {
    return resolveTsconfigFile(path.resolve(rootDir, configuredExtends), configuredExtends);
  }

  const resolver = createRequire(path.join(rootDir, ArchicatDefaults.configFileName));
  return resolvePackageTsconfig(resolver, configuredExtends, configuredExtends);
}

function resolveTsconfigExtends(tsconfigPath: string, extended: string): string {
  if (path.isAbsolute(extended) || extended.startsWith('.')) {
    return resolveTsconfigFile(path.resolve(path.dirname(tsconfigPath), extended), tsconfigPath);
  }

  const resolver = createRequire(tsconfigPath);
  return resolvePackageTsconfig(resolver, extended, tsconfigPath);
}

function resolvePackageTsconfig(resolver: ReturnType<typeof createRequire>, value: string, source: string): string {
  for (const candidate of makeTsconfigCandidates(value)) {
    try {
      return resolver.resolve(candidate);
    } catch {
      continue;
    }
  }

  throw new Error(`Unable to resolve tsconfig extends "${value}": ${source}`);
}

function resolveTsconfigFile(candidate: string, source: string): string {
  for (const entry of makeTsconfigCandidates(candidate)) {
    if (fs.existsSync(entry) && fs.statSync(entry).isFile()) {
      return entry;
    }
  }

  throw new Error(`Unable to resolve tsconfig extends "${candidate}": ${source}`);
}

function makeTsconfigCandidates(value: string): string[] {
  return [value, `${value}.json`, path.join(value, ArchicatDefaults.typescript.consumerTsconfigFileName)];
}

// MARK: - Diagnostics

function formatTsDiagnostic(diagnostic: ts.Diagnostic): string {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

  if (diagnostic.file && diagnostic.start !== undefined) {
    const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    return `${diagnostic.file.fileName}:${position.line + 1}:${position.character + 1} - ${message}`;
  }

  return message;
}
