import fs from 'node:fs';
import path from 'node:path';

// MARK: - Path utilities

export function normalizePath(value: string): string {
  return value.split(path.sep).join('/');
}

export function toPosixRelativeImport(fromFilePath: string, targetFilePath: string): string {
  const fromDir = path.dirname(fromFilePath);
  const parsedTarget = path.parse(targetFilePath);
  const targetWithoutExtension = path.join(parsedTarget.dir, parsedTarget.name);
  let relative = normalizePath(path.relative(fromDir, targetWithoutExtension));

  if (!relative.startsWith('.')) {
    relative = `./${relative}`;
  }

  return `${relative}.js`;
}

export function isPathInside(childPath: string, parentPath: string): boolean {
  const relative = path.relative(parentPath, childPath);
  return relative === '' || (!!relative && !relative.startsWith('..') && !path.isAbsolute(relative));
}

export function assertSafeGeneratedDirectory(rootDir: string, directoryPath: string): void {
  const root = resolvePhysicalPath(rootDir);
  const directory = resolvePhysicalPath(directoryPath);

  if (directory === root || !isPathInside(directory, root)) {
    throw new Error(`Archicat outDir must be a directory inside the project root: ${directoryPath}`);
  }
}

function resolvePhysicalPath(filePath: string): string {
  const absolutePath = path.resolve(filePath);
  const missing: string[] = [];
  let currentPath = absolutePath;

  while (!fs.existsSync(currentPath)) {
    const parentPath = path.dirname(currentPath);

    if (parentPath === currentPath) {
      return absolutePath;
    }

    missing.unshift(path.basename(currentPath));
    currentPath = parentPath;
  }

  return path.join(fs.realpathSync(currentPath), ...missing);
}

export function stripKnownExtension(filePath: string): string {
  return filePath.replace(/\.(?:js|mjs|cjs|ts|mts|cts|tsx)$/u, '');
}

export function makeRelativeDisplayPath(rootDir: string, filePath: string): string {
  return normalizePath(path.relative(rootDir, filePath));
}
