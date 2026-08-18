import fs from 'node:fs';
import path from 'node:path';

import { ArchicatDefaults } from '@src-internal/configuration/archicat-defaults';
import { isPathInside } from '@src-internal/path';

// MARK: - Definition discovery

export function discoverDefinitionFiles(
  rootDir: string,
  includes: readonly string[],
  markerFileName: string,
  excludedRootPaths: readonly string[] = [],
): string[] {
  const files = includes.flatMap((include) => expandInclude(rootDir, include, markerFileName, excludedRootPaths));
  return Array.from(new Set(files)).sort((a, b) => a.localeCompare(b));
}

// MARK: - Include expansion

function expandInclude(
  rootDir: string,
  include: string,
  markerFileName: string,
  excludedRootPaths: readonly string[],
): string[] {
  const resolved = path.resolve(rootDir, include);

  if (include.includes('*')) {
    return expandSingleStarPattern(rootDir, include)
      .filter((filePath) => !excludedRootPaths.some((excludedRootPath) => isPathInside(filePath, excludedRootPath)))
      .filter((filePath) => path.basename(filePath) === markerFileName);
  }

  if (!fs.existsSync(resolved)) {
    return [];
  }

  const stat = fs.statSync(resolved);

  if (stat.isFile()) {
    return path.basename(resolved) === markerFileName ? [resolved] : [];
  }

  if (!stat.isDirectory()) {
    return [];
  }

  return findMarkerFiles(resolved, markerFileName, excludedRootPaths);
}

function findMarkerFiles(rootPath: string, markerFileName: string, excludedRootPaths: readonly string[]): string[] {
  const result: string[] = [];
  const entries = fs.readdirSync(rootPath, { withFileTypes: true });

  for (const entry of entries) {
    if (shouldSkip(entry.name)) {
      continue;
    }

    const entryPath = path.join(rootPath, entry.name);

    if (excludedRootPaths.some((excludedRootPath) => isPathInside(entryPath, excludedRootPath))) {
      continue;
    }

    if (entry.isDirectory()) {
      result.push(...findMarkerFiles(entryPath, markerFileName, excludedRootPaths));
      continue;
    }

    if (entry.isFile() && entry.name === markerFileName) {
      result.push(entryPath);
    }
  }

  return result;
}

function expandSingleStarPattern(rootDir: string, pattern: string): string[] {
  const absolutePattern = path.resolve(rootDir, pattern);
  const parts = absolutePattern.split(path.sep);
  const starSegments = parts.filter((part) => part.includes('*'));

  if (starSegments.length !== 1) {
    throw new Error(`Archicat supports exactly one wildcard segment per include pattern: ${pattern}`);
  }

  const starIndex = parts.findIndex((part) => part.includes('*'));
  const beforeStar = parts.slice(0, starIndex).join(path.sep) || path.sep;
  const wildcard = parts[starIndex] ?? '*';
  const afterStar = parts.slice(starIndex + 1);
  const regexp = makeWildcardRegExp(wildcard);

  if (!fs.existsSync(beforeStar)) {
    return [];
  }

  return fs
    .readdirSync(beforeStar, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => regexp.test(entry.name))
    .map((entry) => path.join(beforeStar, entry.name, ...afterStar))
    .filter((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
}

function makeWildcardRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/gu, '\\$&').replace(/\*/gu, '.*');
  return new RegExp(`^${escaped}$`, 'u');
}

function shouldSkip(name: string): boolean {
  const ignoredDirectoryNames: readonly string[] = ArchicatDefaults.generated.ignoredDirectoryNames;
  return ignoredDirectoryNames.includes(name);
}
