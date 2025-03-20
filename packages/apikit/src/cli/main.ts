import { defineCommand } from 'citty';

import { name, version, description } from '../../package.json';

import { buildCommand } from './build';

export const main = defineCommand({
  meta: {
    name: name,
    version: version,
    description: description,
  },
  subCommands: {
    build: buildCommand,
  },
});
