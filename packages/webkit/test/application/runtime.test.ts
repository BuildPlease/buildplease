import { type Assembly, type AssemblyContainer, CoreSymbols } from '@buildplease/core';
import { createWebKitRuntime } from '@internal/neutral/runtime';
import { describe, expect, it } from 'vitest';

describe('WebKit application runtime', () => {
  it('registers framework assemblies before consumer assemblies and runs lifecycle hooks', async () => {
    const events: string[] = [];
    const consumerAssembly: Assembly = {
      assemble: (container: AssemblyContainer) => {
        expect(container.isBound(CoreSymbols.DI.Formatter.UnitController)).toBe(true);
        events.push('assemblies.consumer');
      },
    };

    const runtime = await createWebKitRuntime({
      hooks: {
        assemblies: () => {
          events.push('assemblies.hook');
          return [consumerAssembly];
        },
        prepare: ({ scope }) => {
          expect(scope.container.isBound(CoreSymbols.DI.Formatter.UnitController)).toBe(true);
          events.push('prepare');
        },
        close: ({ scope }) => {
          expect(scope).toBe(runtime.scope);
          events.push('close');
        },
      },
    });

    expect(events).toEqual(['assemblies.hook', 'assemblies.consumer', 'prepare']);

    await runtime.close();
    expect(events).toEqual(['assemblies.hook', 'assemblies.consumer', 'prepare', 'close']);
  });
});
