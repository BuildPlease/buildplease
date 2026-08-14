import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Resolve `relative` against `base`, unless `relative` is already absolute,
 * in which case just normalize and return it.
 *
 * @param {string} base
 *   A `file://` URL or filesystem path to serve as the base.
 * @param {string} relative
 *   A relative path (e.g. `./foo` or `../bar`) or an absolute filesystem path.
 * @returns {string}
 *   The resulting absolute (normalized) filesystem path.
 * @throws {Error}
 *   If `base` is a non-file URL or cannot be parsed.
 */
export function resolvePath(base: string, relative: string): string {
  // 1) If caller really passed an absolute path, just normalize & return.
  if (path.isAbsolute(relative)) {
    return path.normalize(relative);
  }

  // 2) Otherwise, treat `base` as URL or filesystem path
  let baseDir: string;
  try {
    const maybeUrl = new URL(base);
    if (maybeUrl.protocol !== 'file:') {
      throw new Error(`Unsupported URL protocol "${maybeUrl.protocol}"`);
    }
    baseDir = path.dirname(fileURLToPath(maybeUrl));
  } catch {
    baseDir = base;
  }

  return path.resolve(baseDir, relative);
}

/**
 * Remove or clean a file or directory.
 *
 * @param {string} target
 *   File or directory path (relative or absolute).
 * @param {object} [opts]
 *   Removal options.
 * @param {boolean} [opts.recursive=true]
 *   Recurse into subdirectories when deleting a directory.
 * @param {boolean} [opts.force=true]
 *   Ignore “not found” errors.
 * @param {boolean} [opts.cleanOnly=false]
 *   When true:
 *     - For a directory: delete its contents but leave the directory itself.
 *     - For a file: truncate it without deleting the file.
 * @returns {void}
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
      fs.rmSync(path.join(abs, entry), { recursive: recursive, force: force });
    }
    return;
  }

  if (cleanOnly && stat.isFile()) {
    fs.truncateSync(abs, 0);
    return;
  }

  fs.rmSync(abs, {
    recursive: stat.isDirectory() ? recursive : false,
    force: force,
    maxRetries: 3,
    retryDelay: 100,
  });
}

/**
 * Ensures the directory for a given path exists.
 *
 * @param {string} targetPath
 *   File or directory path (relative or absolute).
 * @returns {string}
 *   The absolute, resolved path.
 * @throws {Error}
 *   If the target directory does not exist.
 */
export function ensureDirectory(targetPath: string): string {
  const absolutePath = resolvePath(process.cwd(), targetPath);
  const directory =
    fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory() ? absolutePath : path.dirname(absolutePath);

  if (!fs.existsSync(directory)) {
    throw new Error(`Directory "${directory}" does not exist.`);
  }
  return absolutePath;
}

/**
 * Creates a directory if it doesn't exist.
 *
 * @param {string} dirPath
 *   The path to the directory (relative or absolute).
 * @returns {string}
 *   The absolute path to the created directory.
 * @throws {Error}
 *   If the path is invalid or a file already exists at that path.
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
 * @param {string} filePath
 *   Path to the file (relative or absolute).
 * @param {string} [content='']
 *   Optional string to write into the file (appended if it already exists).
 * @returns {string}
 *   The absolute path to the created file.
 * @throws {Error}
 *   If the path exists but is not a file, or if writing fails.
 */
export function createFile(filePath: string, content: string = ''): string {
  const absolutePath = resolvePath(process.cwd(), filePath);
  const parentDir = path.dirname(absolutePath);

  // ensure parent directory exists (throws if not)
  ensureDirectory(parentDir);

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

/**
 * Attempt to stat the given path; returns fs.Stats or undefined if it doesn't exist.
 *
 * @param {string} p
 *   The path to check.
 * @returns {fs.Stats | undefined}
 *   The file/directory stats, or undefined if the path does not exist.
 */
function maybeStat(p: string): fs.Stats | undefined {
  try {
    return fs.statSync(p);
  } catch {
    return undefined;
  }
}
