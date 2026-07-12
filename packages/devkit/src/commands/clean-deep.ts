import { readdir, rm } from 'node:fs/promises';
import path from 'node:path';

import { consola } from 'consola';

import { runExecutable } from './run-bin';

const ignoredDirectories = new Set(['.git']);

export interface CleanDeepOptions {
  readonly clearCache: boolean;
  readonly clearLock: boolean;
}

function pnpmCommand(): string {
  return process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
}

function formatPlan(options: CleanDeepOptions): string {
  return [
    'clean-deep plan:',
    '  remove all node_modules directories under the current repo',
    options.clearLock ? '  remove pnpm-lock.yaml' : '  keep pnpm-lock.yaml',
    options.clearCache ? '  clear PNPM store and cache' : '  keep PNPM store and cache',
    '  run pnpm install',
  ].join('\n');
}

function logPlan(options: CleanDeepOptions): void {
  consola.info(formatPlan(options));
}

async function findNodeModulesDirectories(directory: string): Promise<readonly string[]> {
  let entries;

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }

  const directories: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const entryPath = path.join(directory, entry.name);

    if (entry.name === 'node_modules') {
      directories.push(entryPath);
      continue;
    }

    if (ignoredDirectories.has(entry.name)) continue;
    directories.push(...(await findNodeModulesDirectories(entryPath)));
  }

  return directories;
}

async function removeNodeModules(): Promise<void> {
  const directories = await findNodeModulesDirectories(process.cwd());

  for (const directory of directories) {
    await rm(directory, { recursive: true, force: true });
  }

  consola.success(`Removed node_modules directories: ${directories.length}`);
}

async function removeLockFileIfNeeded(clearLock: boolean): Promise<void> {
  if (!clearLock) {
    consola.info('Skipped pnpm-lock.yaml removal');
    return;
  }

  const lockPath = path.join(process.cwd(), 'pnpm-lock.yaml');
  await rm(lockPath, { force: true });
  consola.success('Removed pnpm-lock.yaml');
}

async function clearPnpmCacheIfNeeded(clearCache: boolean): Promise<void> {
  if (!clearCache) {
    consola.info('Skipped PNPM cache clear');
    return;
  }

  consola.start('Clearing PNPM store and cache');
  await runExecutable(pnpmCommand(), ['store', 'prune', '--force']);
  await runExecutable(pnpmCommand(), ['cache', 'delete']);
}

export async function cleanDeep(options: CleanDeepOptions): Promise<void> {
  logPlan(options);
  consola.start('Starting clean-deep');

  await removeNodeModules();
  await removeLockFileIfNeeded(options.clearLock);
  await clearPnpmCacheIfNeeded(options.clearCache);

  consola.start('Installing dependencies');
  await runExecutable(pnpmCommand(), ['install']);

  consola.success('clean-deep complete');
}
