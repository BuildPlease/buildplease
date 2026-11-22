import { CoreApplication } from '@buildplease/core/node';
import { createWebKitRuntime } from '@internal/neutral/runtime';
import type { WebKitApplicationOptions, WebKitRuntime } from '@neutral/application';

export * from '@node/index';

/** Node WebKit application entry point. Configuration is explicitly loaded by its host. */
export class WebKitApplication {
  public static async run(options: WebKitApplicationOptions = {}): Promise<WebKitRuntime> {
    return await CoreApplication.run(async () => createWebKitRuntime(options));
  }
}
