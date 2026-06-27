import { readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';

import { consola } from 'consola';

const targets = ['apps', 'packages'];
const artifactFolders = ['dist', '.output', '.runtime', '.build', '.nuxt'];

async function directoryExists(pathName) {
  try {
    const result = await stat(pathName);
    return result.isDirectory();
  } catch {
    return false;
  }
}

async function listDirectories(pathName) {
  try {
    const entries = await readdir(pathName, { withFileTypes: true });
    const directories = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      directories.push(path.join(pathName, entry.name));
    }

    return directories;
  } catch {
    return [];
  }
}

function displayPath(pathName) {
  return path.relative(process.cwd(), pathName) || '.';
}

async function cleanProject(projectPath) {
  consola.info(`Cleaning ${displayPath(projectPath)}`);

  let deletedCount = 0;
  let skippedCount = 0;

  for (const folderName of artifactFolders) {
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

export async function clean() {
  consola.start('Cleaning build artifacts');

  let totalDeleted = 0;
  let totalSkipped = 0;

  for (const base of targets) {
    if (!(await directoryExists(base))) continue;

    const projects = await listDirectories(base);

    if (projects.length === 0) continue;

    for (const projectPath of projects) {
      const result = await cleanProject(projectPath);
      totalDeleted += result.deletedCount;
      totalSkipped += result.skippedCount;
    }
  }

  consola.success(`Clean complete. Deleted: ${totalDeleted}. Skipped: ${totalSkipped}.`);
}
