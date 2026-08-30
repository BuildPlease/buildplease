import { type Assembly, type AssemblyContainer, CoreSymbols } from '@buildplease/core';
import { describe, expect, it, vi } from 'vitest';

import { runWebKit } from '@/runtime';

const { nodeEnvironmentModuleLoaded } = vi.hoisted(() => ({
  nodeEnvironmentModuleLoaded: vi.fn(),
}));

vi.mock('@buildplease/core/node', () => {
  nodeEnvironmentModuleLoaded();
  return {};
});

describe('browser runWebKit', () => {
  it('does not import the Core Node environment module', async () => {
    await runWebKit({});

    expect(nodeEnvironmentModuleLoaded).not.toHaveBeenCalled();
  });

  it('registers framework assemblies before consumer assemblies and runs lifecycle hooks', async () => {
    const events: string[] = [];
    const consumerAssembly: Assembly = {
      assemble: (container: AssemblyContainer) => {
        expect(container.isBound(CoreSymbols.DI.Formatter.UnitController)).toBe(true);
        events.push('assemblies.consumer');
      },
    };

    const runtime = await runWebKit({
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
