import { loadSelectedEnvironmentConfig } from '@buildplease/core/node';

import { run } from '../../src-internal/runtime';
import type { RunWebKitOptions, WebKitRuntime } from '../../src/runtime/types';

let environmentInitialization: Promise<void> | undefined;

async function initializeEnvironment(): Promise<void> {
  environmentInitialization ??= loadSelectedEnvironmentConfig().then(() => undefined);
  await environmentInitialization;
}

export async function runWebKit(options: RunWebKitOptions): Promise<WebKitRuntime> {
  await initializeEnvironment();

  return run(options);
}
