import { type Assembly, type AssemblyContainer, CoreSymbols } from '@buildplease/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { runWebKit } from '@src-node/runtime';

const { loadSelectedEnvironmentConfig } = vi.hoisted(() => ({
  loadSelectedEnvironmentConfig: vi.fn(),
}));

vi.mock('@buildplease/core/node', () => ({
  loadSelectedEnvironmentConfig: loadSelectedEnvironmentConfig,
}));

describe('Node runWebKit', () => {
  beforeEach(() => {
    loadSelectedEnvironmentConfig.mockReset();
  });

  it('initializes the environment once and creates a fresh runtime for every call', async () => {
    const events: string[] = [];
    const makeConsumerAssembly = (name: string): Assembly => ({
      assemble: (container: AssemblyContainer): void => {
        expect(container.isBound(CoreSymbols.DI.Formatter.UnitController)).toBe(true);
        events.push(`assemblies.${name}`);
      },
    });
    loadSelectedEnvironmentConfig.mockImplementation(() => {
      events.push('environment');
      return Promise.resolve({});
    });

    const first = await runWebKit({
      hooks: {
        assemblies: () => [makeConsumerAssembly('first')],
        prepare: () => {
          events.push('prepare.first');
        },
        close: () => {
          events.push('close.first');
        },
      },
    });
    const second = await runWebKit({
      hooks: {
        assemblies: () => [makeConsumerAssembly('second')],
        prepare: () => {
          events.push('prepare.second');
        },
        close: () => {
          events.push('close.second');
        },
      },
    });

    expect(loadSelectedEnvironmentConfig).toHaveBeenCalledOnce();
    expect(first).not.toBe(second);
    expect(first.scope).not.toBe(second.scope);
    expect(events).toEqual([
      'environment',
      'assemblies.first',
      'prepare.first',
      'assemblies.second',
      'prepare.second',
    ]);

    await first.close();
    await second.close();
    expect(events.slice(-2)).toEqual(['close.first', 'close.second']);
  });
});
