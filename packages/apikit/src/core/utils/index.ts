import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Resolves an absolute path from a given base.
 *
 * @param base - The base directory path or module URL (e.g., import.meta.url).
 * @param relativePath - The relative path to resolve from the base.
 * @returns Absolute resolved path.
 */
export function resolvePath(base: string, relativePath: string): string {
  const basePath = base.startsWith('file://') ? path.dirname(fileURLToPath(base)) : base;
  return path.resolve(basePath, relativePath);
}

/**
 * Ensures the directory for a given path exists.
 *
 * Accepts either a full file path or a directory path.
 * If relative, uses `process.cwd()` as base.
 *
 * @param targetPath - File or directory path.
 * @returns Absolute resolved path.
 * @throws {Error} If the target directory does not exist and cannot be created.
 */
export function ensureDirectory(targetPath: string): string {
  const absolutePath = resolvePath(process.cwd(), targetPath);

  const directory =
    fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory()
      ? absolutePath
      : path.dirname(absolutePath);

  if (!fs.existsSync(directory)) {
    throw new Error(
      `Directory "${directory}" does not exist. Please create it manually or use resolvePath properly.`,
    );
  }

  return absolutePath;
}
