import fs from 'node:fs';
import path from 'node:path';

// MARK: - Fixture IO

export function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    `${content.trim()}
`,
    'utf8',
  );
}

export function readText(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

export function readJson(filePath: string): unknown {
  return JSON.parse(readText(filePath));
}

export function assertFileExists(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Expected file to exist: ${filePath}`);
  }
}
