import { defineCommand } from 'citty';
import { consola } from 'consola';

import { buildCommand } from './build';

export const main = defineCommand({
  meta: {
    name: 'apikit',
  },
  subCommands: {
    build: buildCommand,
  },
  async setup() {
    // Global setup logic
    consola.debug(`Running in ${process.cwd()}`);
  },
});
