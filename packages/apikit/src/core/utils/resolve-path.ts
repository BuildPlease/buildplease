import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * Resolves an absolute path from a given base.
 *
 * @param base - The base directory path or module URL (import.meta.url).
 * @param relativePath - The relative path to resolve from the base.
 * @returns Absolute resolved path.
 */
export function resolvePath(base: string, relativePath: string): string {
  const basePath = base.startsWith('file://') ? path.dirname(fileURLToPath(base)) : base;

  return path.resolve(basePath, relativePath);
}
