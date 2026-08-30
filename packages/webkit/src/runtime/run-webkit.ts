import { run } from '@src-internal/runtime';

import type { RunWebKitOptions, WebKitRuntime } from './types';

export async function runWebKit(options: RunWebKitOptions): Promise<WebKitRuntime> {
  return run(options);
}
