import { readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';

import { Console } from '@meawkit/core/node';

import { loadDevKitConfig, resolveDevKitConfig } from '../../src-internal/configuration';

const cli = new Console();

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
  cli.info(`Cleaning ${displayPath(projectPath)}`);

  let deletedCount = 0;
  let skippedCount = 0;

  for (const folderName of directories) {
    const folderPath = path.join(projectPath, folderName);
    const exists = await directoryExists(folderPath);

    if (!exists) {
      cli.log(`  skip ${folderName}`);
      skippedCount += 1;
      continue;
    }

    await rm(folderPath, { recursive: true, force: true });
    cli.success(`  deleted ${folderName}`);
    deletedCount += 1;
  }

  if (deletedCount === 0) {
    cli.log('  nothing to clean');
  }

  return { deletedCount: deletedCount, skippedCount: skippedCount };
}

export async function clean(): Promise<void> {
  const loaded = await loadDevKitConfig();
  const config = resolveDevKitConfig(loaded.config);

  cli.start('Cleaning build artifacts');

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

  cli.success(`Clean complete. Deleted: ${totalDeleted}. Skipped: ${totalSkipped}.`);
}
