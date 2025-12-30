import { readdir, rm, stat } from 'node:fs/promises';

const targets = ['apps', 'packages'];
const folders = ['dist', '.output', '.runtime', '.build', 'turbo', '.nuxt'];

// MARK: - Logger

const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

const color = (text, code) => `${code}${text}${colors.reset}`;
const line = (prefix, text, tint) => console.log(`${tint ? color(prefix, tint) : prefix} ${text}`);

const logSpacer = () => console.log('');

const logHeader = (text) => line(color('CLI', colors.gray), text, null);
const logTargetHeader = (text) => line(color('CLI', colors.yellow), color(text, colors.yellow), null);
const logSummaryHeader = (text) => line(color('CLI', colors.green), color(text, colors.green), null);

const logOk = (text) => line('✔', text, colors.green);
const logSkip = (text) => line(color('•', colors.dim), color(text, colors.dim), null);
const logWarn = (text) => line(color('⚠', colors.yellow), color(text, colors.yellow), null);
const logError = (text) => line(color('✖', colors.red), color(text, colors.red), null);
const logMuted = (text) => line(color(' ', colors.dim), color(text, colors.dim), null);

// MARK: - Main

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
      directories.push(`${pathName}/${entry.name}`);
    }

    return directories;
  } catch {
    return [];
  }
}

async function cleanProject(projectPath) {
  logTargetHeader(`Cleaning ${projectPath} 🧹`);

  let deletedCount = 0;
  let skippedCount = 0;

  for (const folderName of folders) {
    const folderPath = `${projectPath}/${folderName}`;
    const exists = await directoryExists(folderPath);

    if (!exists) {
      logSkip(`Skipped ${folderName}`);
      skippedCount += 1;
      continue;
    }

    try {
      await rm(folderPath, { recursive: true, force: true });
      logOk(`Deleted ${folderName}`);
      deletedCount += 1;
    } catch (error) {
      logError(`Failed  ${folderName}`);
      logMuted(String(error));
    }
  }

  if (deletedCount === 0) {
    logSkip('Nothing to clean');
  }

  return { deletedCount, skippedCount };
}

async function main() {
  logHeader('Cleaning build artifacts ✨');

  let totalDeleted = 0;
  let totalSkipped = 0;

  for (const base of targets) {
    const projects = await listDirectories(base);

    if (projects.length === 0) {
      logWarn(`No projects found in ${base}/*`);
      logSpacer();
      continue;
    }

    for (const projectPath of projects) {
      const result = await cleanProject(projectPath);
      totalDeleted += result.deletedCount;
      totalSkipped += result.skippedCount;
      logSpacer();
    }
  }

  logSummaryHeader('Summary ✅');
  logOk(`Deleted: ${totalDeleted}`);
  logSkip(`Skipped: ${totalSkipped}`);
  logSpacer();
}

await main();
