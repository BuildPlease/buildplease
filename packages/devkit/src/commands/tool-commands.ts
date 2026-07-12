import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runNodeBin } from './run-bin';
import { loadDevKitConfig, resolveDevKitConfig } from '../../src-internal/configuration';

const dependencyTypes = 'prod,dev,optional,peer';
const eslintConfigPath = fileURLToPath(new URL('../../configs/eslint.config.mjs', import.meta.url));
const prettierConfigPath = fileURLToPath(new URL('../../configs/prettier.config.mjs', import.meta.url));

export async function depCheck(args: readonly string[]): Promise<void> {
  await runNodeBin('npm-check-updates', 'ncu', ['-ws', '--dep', dependencyTypes, ...args]);
}

export async function depUpdate(args: readonly string[]): Promise<void> {
  await runNodeBin('npm-check-updates', 'ncu', ['-ws', '-i', '--dep', dependencyTypes, '--peer', ...args]);
}

export async function format(args: readonly string[]): Promise<void> {
  const loaded = await loadDevKitConfig();
  const config = resolveDevKitConfig(loaded.config);

  await withTemporaryPrettierIgnore(config.prettier.ignore, async (ignorePath) => {
    await runNodeBin('prettier', 'prettier', [
      ...config.prettier.include,
      '--config',
      prettierConfigPath,
      '--ignore-path',
      ignorePath,
      '--check',
      ...args,
    ]);
  });
}

export async function formatFix(args: readonly string[]): Promise<void> {
  const loaded = await loadDevKitConfig();
  const config = resolveDevKitConfig(loaded.config);

  await withTemporaryPrettierIgnore(config.prettier.ignore, async (ignorePath) => {
    await runNodeBin('prettier', 'prettier', [
      ...config.prettier.include,
      '--config',
      prettierConfigPath,
      '--ignore-path',
      ignorePath,
      '--write',
      ...args,
    ]);
  });
}

export async function lint(args: readonly string[]): Promise<void> {
  const loaded = await loadDevKitConfig();
  const config = resolveDevKitConfig(loaded.config);

  await runNodeBin('eslint', 'eslint', [...config.eslint.include, '--config', eslintConfigPath, ...args]);
}

export async function lintFix(args: readonly string[]): Promise<void> {
  const loaded = await loadDevKitConfig();
  const config = resolveDevKitConfig(loaded.config);

  await runNodeBin('eslint', 'eslint', [...config.eslint.include, '--config', eslintConfigPath, '--fix', ...args]);
}

async function withTemporaryPrettierIgnore(
  ignore: readonly string[],
  operation: (ignorePath: string) => Promise<void>,
): Promise<void> {
  const directory = await mkdtemp(path.join(tmpdir(), 'meawkit-devkit-'));
  const ignorePath = path.join(directory, '.prettierignore');

  try {
    await writeFile(ignorePath, `${ignore.join('\n')}\n`, 'utf8');
    await operation(ignorePath);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
