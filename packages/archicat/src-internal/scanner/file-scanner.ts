import fs from 'node:fs';
import path from 'node:path';

// MARK: - Source file scanning

export function listTypeScriptFiles(rootPath: string): string[] {
  if (!fs.existsSync(rootPath)) {
    return [];
  }

  const stat = fs.statSync(rootPath);

  if (stat.isFile()) {
    return isTypeScriptSourceFile(rootPath) ? [rootPath] : [];
  }

  return walk(rootPath)
    .filter(isTypeScriptSourceFile)
    .sort((a, b) => a.localeCompare(b));
}

export function isTypeScriptSourceFile(filePath: string): boolean {
  return /\.(?:ts|mts|cts|tsx)$/u.test(filePath) && !/\.d\.(?:ts|mts|cts)$/u.test(filePath);
}

// MARK: - File walking

function walk(rootPath: string): string[] {
  const result: string[] = [];
  const entries = fs.readdirSync(rootPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(rootPath, entry.name);

    if (entry.isDirectory()) {
      result.push(...walk(entryPath));
      continue;
    }

    if (entry.isFile()) {
      result.push(entryPath);
    }
  }

  return result;
}
