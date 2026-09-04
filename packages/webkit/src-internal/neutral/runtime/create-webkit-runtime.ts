import { CoreAssembly, ScopeController } from '@buildplease/core';
import type { WebKitApplicationContext, WebKitApplicationOptions, WebKitRuntime } from '@neutral/application';
import { WebKitAssembly } from '@neutral/di/assembly';

export async function createWebKitRuntime(options: WebKitApplicationOptions): Promise<WebKitRuntime> {
  const scope = new ScopeController();
  const consumerAssemblies = options.hooks?.assemblies?.() ?? [];
  const context: WebKitApplicationContext = { scope: scope };

  await scope.registerAssemblies([new CoreAssembly(), new WebKitAssembly(), ...consumerAssemblies]);
  await options.hooks?.prepare?.(context);

  return {
    scope: scope,
    close: async () => options.hooks?.close?.(context),
  };
}
