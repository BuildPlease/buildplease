import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { execa } from 'execa';

const require = createRequire(import.meta.url);

export class CommandFailedError extends Error {
  constructor(command, exitCode) {
    super(`${command} exited with code ${exitCode}`);
    this.exitCode = exitCode;
  }
}

function resolvePackageBin(packageName, binName) {
  const packageJsonPath = require.resolve(`${packageName}/package.json`);
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const bin = typeof packageJson.bin === 'string' ? packageJson.bin : packageJson.bin?.[binName];

  if (!bin) {
    throw new Error(`Unable to find ${binName} binary in ${packageName}`);
  }

  return path.resolve(path.dirname(packageJsonPath), bin);
}

export async function runExecutable(command, args) {
  try {
    await execa(command, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
    });
  } catch (error) {
    if (typeof error?.exitCode === 'number') {
      throw new CommandFailedError(command, error.exitCode);
    }

    throw error;
  }
}

export async function runNodeBin(packageName, binName, args) {
  const binPath = resolvePackageBin(packageName, binName);
  await runExecutable(process.execPath, [binPath, ...args]);
}
