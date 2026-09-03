import { CoreApplication } from '@buildplease/core/browser';
import { createWebKitRuntime } from '@internal/neutral/runtime';
import type { WebKitApplicationOptions, WebKitRuntime } from '@neutral/application';

export * from '@browser/index';

/** Runs browser application startup. */
export class WebKitApplication {
  /**
   * Runs application startup.
   *
   * @param options - Startup options.
   * @returns Application runtime.
   */
  public static async run(options: WebKitApplicationOptions = {}): Promise<WebKitRuntime> {
    return await CoreApplication.run(async () => createWebKitRuntime(options));
  }
}
