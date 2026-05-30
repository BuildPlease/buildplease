import { fileURLToPath } from 'node:url';

import { runNodeBin } from './run-bin.mjs';

const dependencyTypes = 'prod,dev,optional,peer';
const eslintConfigPath = fileURLToPath(new URL('../configs/eslint.config.mjs', import.meta.url));
const prettierConfigPath = fileURLToPath(new URL('../configs/prettier.config.mjs', import.meta.url));
const prettierIgnorePath = fileURLToPath(new URL('../configs/.prettierignore', import.meta.url));

export async function depCheck(args) {
  await runNodeBin('npm-check-updates', 'ncu', ['-ws', '--dep', dependencyTypes, ...args]);
}

export async function depUpdate(args) {
  await runNodeBin('npm-check-updates', 'ncu', ['-ws', '-i', '--dep', dependencyTypes, '--peer', ...args]);
}

export async function format(args) {
  await runNodeBin('prettier', 'prettier', [
    '.',
    '--config',
    prettierConfigPath,
    '--ignore-path',
    prettierIgnorePath,
    '--check',
    ...args,
  ]);
}

export async function formatFix(args) {
  await runNodeBin('prettier', 'prettier', [
    '.',
    '--config',
    prettierConfigPath,
    '--ignore-path',
    prettierIgnorePath,
    '--write',
    ...args,
  ]);
}

export async function lint(args) {
  await runNodeBin('eslint', 'eslint', ['.', '--config', eslintConfigPath, ...args]);
}

export async function lintFix(args) {
  await runNodeBin('eslint', 'eslint', ['.', '--config', eslintConfigPath, '--fix', ...args]);
}
