import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Resolves an absolute path from a given base.
 *
 * @param base - The base directory path or module URL (e.g., `import.meta.url`).
 * @param relativePath - The relative path to resolve from the base.
 * @returns Absolute resolved path.
 */
export function resolvePath(base: string, relativePath: string): string {
  const basePath = base.startsWith('file://') ? path.dirname(fileURLToPath(base)) : base;
  return path.resolve(basePath, relativePath);
}

/**
 * Remove or clean a file or directory.
 *
 * @param target - File or directory path (relative or absolute).
 * @param opts - Removal options.
 * @param [opts.recursive=true] - Recurse into subdirectories when deleting a directory.
 * @param [opts.force=true] - Ignore “not found” errors.
 * @param [opts.cleanOnly=false] - If true:
 *   - For a directory: delete its contents but leave the directory itself.
 *   - For a file: truncate it without deleting the file.
 */
export function removePath(
  target: string,
  opts: { recursive?: boolean; force?: boolean; cleanOnly?: boolean } = {},
): void {
  const abs = resolvePath(process.cwd(), target);
  if (!fs.existsSync(abs)) return;

  const stat = fs.statSync(abs);
  const { recursive = true, force = true, cleanOnly = false } = opts;

  if (cleanOnly && stat.isDirectory()) {
    for (const entry of fs.readdirSync(abs)) {
      fs.rmSync(path.join(abs, entry), { recursive, force });
    }
    return;
  }

  if (cleanOnly && stat.isFile()) {
    fs.truncateSync(abs, 0);
    return;
  }

  fs.rmSync(abs, {
    recursive: stat.isDirectory() ? recursive : false,
    force,
    maxRetries: 3,
    retryDelay: 100,
  });
}

/**
 * Ensures the directory for a given path exists.
 *
 * @param targetPath - File or directory path.
 * @returns Absolute resolved path.
 * @throws If the target directory does not exist.
 */
export function ensureDirectory(targetPath: string): string {
  const absolutePath = resolvePath(process.cwd(), targetPath);
  const directory =
    fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory()
      ? absolutePath
      : path.dirname(absolutePath);

  if (!fs.existsSync(directory)) {
    throw new Error(`Directory "${directory}" does not exist.`);
  }
  return absolutePath;
}

/**
 * Creates a directory if it doesn't exist.
 *
 * @param dirPath - The path to the directory.
 * @returns Absolute path to the created directory.
 * @throws If the path is invalid or a file already exists there.
 */
export function createDirectory(dirPath: string): string {
  const absolutePath = resolvePath(process.cwd(), dirPath);

  if (path.extname(dirPath)) {
    console.warn(`[createDirectory] Warning: "${dirPath}" looks like a file path.`);
  }

  try {
    if (!fs.existsSync(absolutePath)) {
      fs.mkdirSync(absolutePath, { recursive: true });
    } else if (!fs.statSync(absolutePath).isDirectory()) {
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
 * @param filePath - Path to the file (relative or absolute).
 * @param content  - Optional string to write into the file (appended if exists).
 * @returns Absolute path to the created file.
 * @throws If the path exists but is not a file, or writing fails.
 */
export function createFile(filePath: string, content: string = ''): string {
  const absolutePath = resolvePath(process.cwd(), filePath);
  const parentDir = path.dirname(absolutePath);

  // ensure parent directory exists (throws if not)
  ensureDirectory(parentDir);

  // stat or undefined if missing
  const stat = maybeStat(absolutePath);

  if (!stat) {
    // file doesn't exist → create or seed
    fs.writeFileSync(absolutePath, content, { encoding: 'utf8', flag: 'w' });
  } else {
    if (!stat.isFile()) {
      throw new Error(`"${absolutePath}" exists but is not a file.`);
    }
    if (content) {
      // append only if content provided
      fs.writeFileSync(absolutePath, content, { encoding: 'utf8', flag: 'a' });
    }
  }

  return absolutePath;
}

// MARK: Private

/**
 * Try to stat the given path; return Stats or undefined if it doesn't exist.
 */
function maybeStat(p: string): fs.Stats | undefined {
  try {
    return fs.statSync(p);
  } catch {
    return undefined;
  }
}
