import { defineCommand } from 'citty';

import { createBuildAppCommand, createBuildI18nCommand } from './commands';
import type { CliRuntime } from './runtime';

export function createMain(runtime: CliRuntime) {
  return defineCommand({
    meta: {
      name: runtime.package.name,
      version: runtime.package.version,
    },
    subCommands: {
      'build:app': createBuildAppCommand(runtime),
      'build:i18n': createBuildI18nCommand(runtime),
    },
  });
}
