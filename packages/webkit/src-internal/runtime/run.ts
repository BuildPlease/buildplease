import { coreAssembly, ScopeController } from '@buildplease/core';
import { webkitAssembly } from '@src-internal/di/assembly';

import type { RunWebKitOptions, WebKitRuntime, WebKitRuntimeHookContext } from '@/runtime/types';

export async function run(options: RunWebKitOptions): Promise<WebKitRuntime> {
  const scope = new ScopeController();
  const consumerAssemblies = options.hooks?.assemblies?.() ?? [];
  const hookContext: WebKitRuntimeHookContext = { scope: scope };

  await scope.registerAssemblies([...coreAssembly(), ...webkitAssembly(), ...consumerAssemblies]);
  await options.hooks?.prepare?.(hookContext);

  return {
    scope: scope,
    close: async () => options.hooks?.close?.(hookContext),
  };
}
