import { readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';

import { consola } from 'consola';

import { loadDevKitConfig, resolveDevKitConfig } from '../../src-internal/configuration';

async function directoryExists(pathName: string): Promise<boolean> {
  try {
    const result = await stat(pathName);
    return result.isDirectory();
  } catch {
    return false;
  }
}

async function listDirectories(pathName: string): Promise<readonly string[]> {
  try {
    const entries = await readdir(pathName, { withFileTypes: true });
    const directories: string[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      directories.push(path.join(pathName, entry.name));
    }

    return directories;
  } catch {
    return [];
  }
}

function displayPath(pathName: string): string {
  return path.relative(process.cwd(), pathName) || '.';
}

async function cleanProject(projectPath: string, directories: readonly string[]) {
  consola.info(`Cleaning ${displayPath(projectPath)}`);

  let deletedCount = 0;
  let skippedCount = 0;

  for (const folderName of directories) {
    const folderPath = path.join(projectPath, folderName);
    const exists = await directoryExists(folderPath);

    if (!exists) {
      consola.log(`  skip ${folderName}`);
      skippedCount += 1;
      continue;
    }

    await rm(folderPath, { recursive: true, force: true });
    consola.success(`  deleted ${folderName}`);
    deletedCount += 1;
  }

  if (deletedCount === 0) {
    consola.log('  nothing to clean');
  }

  return { deletedCount, skippedCount };
}

export async function clean(): Promise<void> {
  const loaded = await loadDevKitConfig();
  const config = resolveDevKitConfig(loaded.config);

  consola.start('Cleaning build artifacts');

  let totalDeleted = 0;
  let totalSkipped = 0;

  for (const base of config.clean.targets) {
    if (!(await directoryExists(base))) continue;

    const projects = await listDirectories(base);

    if (projects.length === 0) continue;

    for (const projectPath of projects) {
      const result = await cleanProject(projectPath, config.clean.directories);
      totalDeleted += result.deletedCount;
      totalSkipped += result.skippedCount;
    }
  }

  consola.success(`Clean complete. Deleted: ${totalDeleted}. Skipped: ${totalSkipped}.`);
}
