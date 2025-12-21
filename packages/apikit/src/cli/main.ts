import pkg from '../../package.json' assert { type: 'json' };
import { defineCommand } from 'citty';

import { buildCommand } from './build';

const { name, version, description } = pkg;

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
