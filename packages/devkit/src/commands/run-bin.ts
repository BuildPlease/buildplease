import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { execa } from 'execa';

const require = createRequire(import.meta.url);

export class CommandFailedError extends Error {
  readonly exitCode: number;

  constructor(command: string, exitCode: number) {
    super(`${command} exited with code ${exitCode}`);
    this.exitCode = exitCode;
  }
}

function resolvePackageBin(packageName: string, binName: string): string {
  const packageJsonPath = require.resolve(`${packageName}/package.json`);
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
    readonly bin?: string | Record<string, string>;
  };
  const bin = typeof packageJson.bin === 'string' ? packageJson.bin : packageJson.bin?.[binName];

  if (!bin) {
    throw new Error(`Unable to find ${binName} binary in ${packageName}`);
  }

  return path.resolve(path.dirname(packageJsonPath), bin);
}

export async function runExecutable(command: string, args: readonly string[]): Promise<void> {
  try {
    await execa(command, [...args], {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
    });
  } catch (error) {
    if (typeof (error as { readonly exitCode?: unknown })?.exitCode === 'number') {
      throw new CommandFailedError(command, (error as { readonly exitCode: number }).exitCode);
    }

    throw error;
  }
}

export async function runNodeBin(packageName: string, binName: string, args: readonly string[]): Promise<void> {
  const binPath = resolvePackageBin(packageName, binName);
  await runExecutable(process.execPath, [binPath, ...args]);
}
