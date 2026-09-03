import { CoreApplication, loadBuild, loadSelectedEnvironmentConfig } from '@buildplease/core/node';
import { createWebKitRuntime } from '@internal/neutral/runtime';
import type { WebKitApplicationOptions, WebKitRuntime } from '@neutral/application';

export * from '@node/index';

// Build and selected-environment preparation are process-scoped.
let applicationInitialization: Promise<void> | undefined;

function initializeApplication(): Promise<void> {
  applicationInitialization ??= loadApplication();
  return applicationInitialization;
}

async function loadApplication(): Promise<void> {
  await loadBuild();
  await loadSelectedEnvironmentConfig();
}

/** Runs Node application startup. */
export class WebKitApplication {
  /**
   * Runs application startup.
   *
   * @param options - Startup options.
   * @returns Application runtime.
   */
  public static async run(options: WebKitApplicationOptions = {}): Promise<WebKitRuntime> {
    return await CoreApplication.run(async () => {
      await initializeApplication();
      return await createWebKitRuntime(options);
    });
  }
}
