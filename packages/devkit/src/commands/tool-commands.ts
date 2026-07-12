import { fileURLToPath } from 'node:url';

import { runNodeBin } from './run-bin';
import { loadDevKitConfig, resolveDevKitConfig } from '../../src-internal/configuration';

const DEFAULT_DEPENDENCY_TYPES = ['prod', 'dev', 'optional', 'peer'] as const;

const eslintConfigPath = fileURLToPath(new URL('../../configs/eslint.config.mjs', import.meta.url));
const prettierConfigPath = fileURLToPath(new URL('../../configs/prettier.config.mjs', import.meta.url));

export async function depCheck(args: readonly string[]): Promise<void> {
  await runNodeBin('npm-check-updates', 'ncu', ['-ws', '--dep', DEFAULT_DEPENDENCY_TYPES.join(','), ...args]);
}

export async function depUpdate(args: readonly string[]): Promise<void> {
  await runNodeBin('npm-check-updates', 'ncu', [
    '-ws',
    '-i',
    '--dep',
    DEFAULT_DEPENDENCY_TYPES.join(','),
    '--peer',
    ...args,
  ]);
}

export async function format(args: readonly string[]): Promise<void> {
  const loaded = await loadDevKitConfig();
  const config = resolveDevKitConfig(loaded.config);

  await runNodeBin('prettier', 'prettier', [
    ...config.format.include,
    ...toPrettierIgnoreGlobs(config.ignore),
    '--config',
    prettierConfigPath,
    '--check',
    ...args,
  ]);
}

export async function formatFix(args: readonly string[]): Promise<void> {
  const loaded = await loadDevKitConfig();
  const config = resolveDevKitConfig(loaded.config);

  await runNodeBin('prettier', 'prettier', [
    ...config.format.include,
    ...toPrettierIgnoreGlobs(config.ignore),
    '--config',
    prettierConfigPath,
    '--write',
    ...args,
  ]);
}

export async function lint(args: readonly string[]): Promise<void> {
  const loaded = await loadDevKitConfig();
  const config = resolveDevKitConfig(loaded.config);

  await runNodeBin('eslint', 'eslint', [...config.lint.include, '--config', eslintConfigPath, ...args]);
}

export async function lintFix(args: readonly string[]): Promise<void> {
  const loaded = await loadDevKitConfig();
  const config = resolveDevKitConfig(loaded.config);

  await runNodeBin('eslint', 'eslint', [...config.lint.include, '--config', eslintConfigPath, '--fix', ...args]);
}

function toPrettierIgnoreGlobs(ignore: readonly string[]): readonly string[] {
  return ignore.map((pattern) => (pattern.startsWith('!') ? pattern : `!${pattern}`));
}
