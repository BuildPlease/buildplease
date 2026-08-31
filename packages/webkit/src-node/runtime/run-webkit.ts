import { loadBuild, loadSelectedEnvironmentConfig } from '@buildplease/core/node';

import type { RunWebKitOptions, WebKitRuntime } from '../../src/runtime/types';
import { run } from '../../src-internal/runtime';

let applicationInitialization: Promise<void> | undefined;

async function initializeApplication(): Promise<void> {
  applicationInitialization ??= (async () => {
    await loadBuild();
    await loadSelectedEnvironmentConfig();
  })();
  await applicationInitialization;
}

export async function runWebKit(options: RunWebKitOptions): Promise<WebKitRuntime> {
  await initializeApplication();

  return run(options);
}
