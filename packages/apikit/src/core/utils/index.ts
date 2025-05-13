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
 * Ensures the directory for a given path exists.
 *
 * Accepts either a full file path or a directory path.
 * If relative, uses `process.cwd()` as base.
 *
 * @param targetPath - File or directory path.
 * @returns Absolute resolved path.
 * @throws {Error} If the target directory does not exist.
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

/**
 * Creates a directory if it doesn't exist.
 * Throws if creation fails or if a file already exists at the path.
 *
 * @param dirPath - The path to the directory.
 * @returns Absolute path to the created directory.
 * @throws {Error} If the directory cannot be created or path is invalid.
 */
export function createDirectory(dirPath: string): string {
  const absolutePath = resolvePath(process.cwd(), dirPath);

  if (path.extname(dirPath)) {
    console.warn(`[createDirectory] Warning: "${dirPath}" looks like a file path (has extension).`);
  }

  try {
    if (!fs.existsSync(absolutePath)) {
      fs.mkdirSync(absolutePath, { recursive: true });
    } else if (!fs.statSync(absolutePath).isDirectory()) {
      throw new Error(`"${absolutePath}" exists but is not a directory.`);
    }
    return absolutePath;
  } catch (err) {
    throw new Error(`Failed to create directory "${absolutePath}": ${(err as Error).message}`);
  }
}

/**
 * Creates a file if it doesn't exist.
 * Also ensures the parent directory exists.
 *
 * @param filePath - Path to the file.
 * @returns Absolute path to the created file.
 * @throws {Error} If the file or its parent directory cannot be created.
 */
export function createFile(filePath: string): string {
  const absolutePath = resolvePath(process.cwd(), filePath);
  const parentDir = path.dirname(absolutePath);

  if (!path.extname(filePath)) {
    console.warn(
      `[createFile] Warning: "${filePath}" has no extension — are you sure it's a file?`,
    );
  }

  createDirectory(parentDir);

  try {
    if (!fs.existsSync(absolutePath)) {
      fs.writeFileSync(absolutePath, '', { flag: 'w' });
    } else if (!fs.statSync(absolutePath).isFile()) {
      throw new Error(`"${absolutePath}" exists but is not a file.`);
    }
    return absolutePath;
  } catch (err) {
    throw new Error(`Failed to create file "${absolutePath}": ${(err as Error).message}`);
  }
}
