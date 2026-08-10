import path from 'node:path';

import { Console } from '@meawkit/core/node';

const cli = new Console();

export interface CommandOptions {
  readonly dir?: string;
  readonly config?: string;
}

export const commandArgs = {
  dir: {
    type: 'string',
    description: 'Directory to look for the config file',
    name: 'dir',
    alias: 'd',
    required: false,
  },
  config: {
    type: 'string',
    name: 'config',
    alias: 'c',
    description: 'Config file name or path relative to the selected project directory.',
    required: false,
  },
} as const;

export function formatPath(filePath: string): string {
  const relativePath = path.relative(process.cwd(), filePath);

  if (!relativePath || relativePath.startsWith('..')) return filePath;

  return relativePath;
}

export async function runInDirectory<T>(dir: string, task: () => Promise<T>): Promise<T> {
  const previousCwd = process.cwd();

  try {
    process.chdir(dir);
    return await task();
  } finally {
    process.chdir(previousCwd);
  }
}

export function fail(title: string, error: unknown): never {
  cli.error(title);
  cli.error(error instanceof Error ? error.message : String(error));

  process.exit(1);
}
