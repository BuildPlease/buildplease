import { type Assembly, type AssemblyContainer, CoreSymbols } from '@buildplease/core';
import { runWebKit } from '@src-node/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { loadBuild, loadSelectedEnvironmentConfig } = vi.hoisted(() => ({
  loadBuild: vi.fn(),
  loadSelectedEnvironmentConfig: vi.fn(),
}));

vi.mock('@buildplease/core/node', () => ({
  loadBuild: loadBuild,
  loadSelectedEnvironmentConfig: loadSelectedEnvironmentConfig,
}));

describe('Node runWebKit', () => {
  beforeEach(() => {
    loadBuild.mockReset();
    loadSelectedEnvironmentConfig.mockReset();
  });

  it('initializes the BuildPlease application once and creates a fresh runtime for every call', async () => {
    const events: string[] = [];
    const makeConsumerAssembly = (name: string): Assembly => ({
      assemble: (container: AssemblyContainer): void => {
        expect(container.isBound(CoreSymbols.DI.Formatter.UnitController)).toBe(true);
        events.push(`assemblies.${name}`);
      },
    });
    loadBuild.mockImplementation(() => {
      events.push('build');
      return Promise.resolve({});
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

    expect(loadBuild).toHaveBeenCalledOnce();
    expect(loadSelectedEnvironmentConfig).toHaveBeenCalledOnce();
    expect(first).not.toBe(second);
    expect(first.scope).not.toBe(second.scope);
    expect(events.slice(0, 2)).toEqual(['build', 'environment']);
    expect(events.slice(2)).toEqual(['assemblies.first', 'prepare.first', 'assemblies.second', 'prepare.second']);

    await first.close();
    await second.close();
    expect(events.slice(-2)).toEqual(['close.first', 'close.second']);
  });
});
