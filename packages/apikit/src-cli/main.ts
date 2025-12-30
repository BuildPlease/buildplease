import { defineCommand } from 'citty';
import { loadPackageJson, resolvePath } from '@nidavellirx/meowv-core/node';

import { buildCommand } from './build';

const pkg = loadPackageJson(resolvePath(import.meta.url, '../../package.json'));

export const main = defineCommand({
  meta: {
    name: pkg.name.original,
    version: pkg.version,
  },
  subCommands: {
    build: buildCommand,
  },
});
