import { type Stats, promises as fs } from 'node:fs';
import path from 'node:path';

import { resolvePath } from '@node/file';

/**
 * Remove or clean a file or directory.
 *
 * @async
 * @param target - File or directory path (relative or absolute).
 * @param opts - Removal options.
 * @param [opts.recursive=true] - Recurse into subdirectories when deleting a directory.
 * @param [opts.force=true] - Ignore “not found” errors (i.e. don’t throw if the path doesn’t exist).
 * @param [opts.cleanOnly=false] - If true:
 *   - For a directory: delete its contents but leave the directory itself.
 *   - For a file: truncate it (empty its contents) without deleting the file.
 */
export async function removePathAsync(
  target: string,
  opts: {
    recursive?: boolean;
    force?: boolean;
    cleanOnly?: boolean;
  } = {},
): Promise<void> {
  const abs = resolvePath(process.cwd(), target);
  let stat;
  try {
    stat = await fs.stat(abs);
  } catch (err: any) {
    if ((opts.force ?? true) && err.code === 'ENOENT') return;
    throw err;
  }

  const { recursive = true, force = true, cleanOnly = false } = opts;

  if (cleanOnly && stat.isDirectory()) {
    const entries = await fs.readdir(abs);
    for (const entry of entries) {
      await fs.rm(path.join(abs, entry), { recursive: recursive, force: force });
    }
    return;
  }

  if (cleanOnly && stat.isFile()) {
    await fs.truncate(abs, 0);
    return;
  }

  await fs.rm(abs, {
    recursive: stat.isDirectory() ? recursive : false,
    force: force,
    maxRetries: 3,
    retryDelay: 100,
  });
}

/**
 * Ensures the directory for a given path exists.
 *
 * @async
 * @param targetPath - File or directory path.
 * @returns Absolute resolved path.
 * @throws {Error} If the target directory does not exist.
 */
export async function ensureDirectoryAsync(targetPath: string): Promise<string> {
  const absolutePath = resolvePath(process.cwd(), targetPath);
  let stat;
  try {
    stat = await fs.stat(absolutePath);
  } catch {
    // treat as non-existent; we'll check dirname below
  }

  const directory = stat?.isDirectory() ? absolutePath : path.dirname(absolutePath);

  try {
    const dirStat = await fs.stat(directory);
    if (!dirStat.isDirectory()) {
      throw new Error(`"${directory}" exists but is not a directory.`);
    }
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      throw new Error(`Directory "${directory}" does not exist.`);
    }
    throw err;
  }

  return absolutePath;
}

/**
 * Creates a directory if it doesn't exist.
 *
 * @async
 * @param dirPath - The path to the directory.
 * @returns Absolute path to the created directory.
 * @throws {Error} If the directory cannot be created or path is invalid.
 */
export async function createDirectoryAsync(dirPath: string): Promise<string> {
  const absolutePath = resolvePath(process.cwd(), dirPath);

  if (path.extname(dirPath)) {
    console.warn(`[createDirectory] Warning: "${dirPath}" looks like a file path (has extension).`);
  }

  try {
    let stat;
    try {
      stat = await fs.stat(absolutePath);
    } catch {
      // not exist
    }

    if (!stat) {
      await fs.mkdir(absolutePath, { recursive: true });
    } else if (!stat.isDirectory()) {
      throw new Error(`"${absolutePath}" exists but is not a directory.`);
    }

    return absolutePath;
  } catch (err: any) {
    throw new Error(`Failed to create directory "${absolutePath}": ${err.message}`);
  }
}

/**
 * Creates a file if it doesn't exist, and optionally seeds/appends content.
 * Also ensures its parent directory exists.
 *
 * @async
 * @param filePath - Path to the file (relative or absolute).
 * @param content  - Optional string to write into the file (appended if exists).
 * @returns Absolute path to the created file.
 * @throws If the path exists but is not a file, or writing fails.
 */
export async function createFileAsync(filePath: string, content: string = ''): Promise<string> {
  const absolutePath = resolvePath(process.cwd(), filePath);
  const parentDir = path.dirname(absolutePath);

  await ensureDirectoryAsync(parentDir);

  try {
    const stat = await maybeStat(absolutePath);

    if (!stat) {
      await fs.writeFile(absolutePath, content, { encoding: 'utf8', flag: 'w' });
    } else {
      if (!stat.isFile()) {
        throw new Error(`"${absolutePath}" exists but is not a file.`);
      }
      if (content) {
        await fs.writeFile(absolutePath, content, { encoding: 'utf8', flag: 'a' });
      }
    }

    return absolutePath;
  } catch (err: any) {
    throw new Error(`Failed to create file "${absolutePath}": ${err.message}`);
  }
}

// MARK: Private

/**
 * Try to stat the path; return `Stats` or `undefined` if ENOENT.
 */
async function maybeStat(p: string): Promise<Stats | undefined> {
  try {
    return await fs.stat(p);
  } catch (err: any) {
    if (err.code === 'ENOENT') return undefined;
    throw err;
  }
}
