import { runMain as _runMain } from 'citty';

import { createMain } from './main';
import type { CliRuntime } from './runtime';

export function runMain(runtime: CliRuntime) {
  return _runMain(createMain(runtime));
}
