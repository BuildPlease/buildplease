import fs from 'node:fs';

import { loadPackageJSON, resolvePath } from '@meawkit/core/node';
import { defineCommand } from 'citty';

import { buildAppCommand, buildI18nCommand } from './commands';

const pkg = loadPackageJSON(resolvePackageJSONPath());

export const main = defineCommand({
  meta: {
    name: pkg.name.original,
    version: pkg.version,
  },
  subCommands: {
    'build:app': buildAppCommand,
    'build:i18n': buildI18nCommand,
  },
});

function resolvePackageJSONPath(): string {
  const candidates = [
    resolvePath(import.meta.url, '../package.json'),
    resolvePath(import.meta.url, '../../package.json'),
  ];

  const packageJSONPath = candidates.find((candidate) => fs.existsSync(candidate));

  if (!packageJSONPath) throw new Error('Unable to resolve ApiKit package.json.');

  return packageJSONPath;
}
