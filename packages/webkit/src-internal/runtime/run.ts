import { ScopeController } from '@buildplease/core';

import type { RunWebKitOptions, WebKitRuntime, WebKitRuntimeHookContext } from '../../src/runtime/types';
import { makeAssemblies } from '../di';

export async function run(options: RunWebKitOptions): Promise<WebKitRuntime> {
  const scope = new ScopeController();
  const consumerAssemblies = options.hooks?.assemblies?.() ?? [];
  const hookContext: WebKitRuntimeHookContext = { scope: scope };

  await scope.registerAssemblies([...makeAssemblies(), ...consumerAssemblies]);
  await options.hooks?.prepare?.(hookContext);

  return {
    scope: scope,
    close: async () => options.hooks?.close?.(hookContext),
  };
}
