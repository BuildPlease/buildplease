import { defineCommand } from 'citty';

import { createBuildAppCommand } from './commands';
import type { CliRuntime } from './runtime';

export function createMain(runtime: CliRuntime) {
  return defineCommand({
    meta: {
      name: runtime.package.name,
      version: runtime.package.version,
    },
    subCommands: {
      'build:app': createBuildAppCommand(runtime),
    },
  });
}
