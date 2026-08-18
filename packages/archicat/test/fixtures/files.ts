import fs from 'node:fs';
import path from 'node:path';

export function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${content.trim()}\n`, 'utf8');
}

export function readText(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

export function readJson<T>(filePath: string): T {
  return JSON.parse(readText(filePath)) as T;
}
