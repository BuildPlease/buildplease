import { coreAssembly, ScopeController } from '@buildplease/core';
import { webkitAssembly } from '@internal/neutral/di/assembly';
import type { WebKitApplicationContext, WebKitApplicationOptions, WebKitRuntime } from '@neutral/application';

export async function createWebKitRuntime(options: WebKitApplicationOptions): Promise<WebKitRuntime> {
  const scope = new ScopeController();
  const consumerAssemblies = options.hooks?.assemblies?.() ?? [];
  const context: WebKitApplicationContext = { scope: scope };

  await scope.registerAssemblies([...coreAssembly(), ...webkitAssembly(), ...consumerAssemblies]);
  await options.hooks?.prepare?.(context);

  return {
    scope: scope,
    close: async () => options.hooks?.close?.(context),
  };
}
