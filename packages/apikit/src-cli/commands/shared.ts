import { Console } from '@buildplease/core/node';

const cli = new Console();

export interface CommandOptions {
  readonly dir?: string;
}

export const commandArgs = {
  dir: {
    type: 'string',
    description: 'Application directory',
    name: 'dir',
    alias: 'd',
    required: false,
  },
} as const;

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
