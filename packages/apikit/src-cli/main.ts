import { loadPackageJSON, resolvePath } from '@meawkit/core/node';
import { defineCommand } from 'citty';

import { buildCommand } from './build';

const pkg = loadPackageJSON(resolvePath(import.meta.url, '../../package.json'));

export const main = defineCommand({
  meta: {
    name: pkg.name.original,
    version: pkg.version,
  },
  subCommands: {
    build: buildCommand,
  },
});
