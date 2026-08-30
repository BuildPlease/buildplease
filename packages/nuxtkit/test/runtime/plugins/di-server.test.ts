import { afterEach, describe, expect, it, vi } from 'vitest';

import plugin from '@/src/runtime/plugins/di.server';

const { runWebKit } = vi.hoisted(() => ({
  runWebKit: vi.fn(),
}));

vi.mock('@buildplease/webkit/node', () => ({ runWebKit: runWebKit }));

describe('server WebKit Nuxt plugin', () => {
  afterEach(() => {
    runWebKit.mockReset();
  });

  it('creates a fresh runtime with assemblies from the current Nuxt app', async () => {
    const firstAssembly = { assemble: vi.fn() };
    const secondAssembly = { assemble: vi.fn() };
    const firstRuntime = { scope: { getInstance: vi.fn() }, close: vi.fn() };
    const secondRuntime = { scope: { getInstance: vi.fn() }, close: vi.fn() };
    const registeredAssemblies: unknown[] = [];

    runWebKit
      .mockImplementationOnce(async (options) => {
        registeredAssemblies.push(options.hooks.assemblies());
        return firstRuntime;
      })
      .mockImplementationOnce(async (options) => {
        registeredAssemblies.push(options.hooks.assemblies());
        return secondRuntime;
      });

    const setup = (plugin as { setup: (nuxt: unknown) => Promise<unknown> }).setup;
    const first = await setup({ $webkitAssemblies: () => [firstAssembly] });
    const second = await setup({ $webkitAssemblies: () => [secondAssembly] });

    expect(runWebKit).toHaveBeenCalledTimes(2);
    expect(registeredAssemblies).toEqual([[firstAssembly], [secondAssembly]]);
    expect(first).toMatchObject({ provide: { scopeController: firstRuntime.scope } });
    expect(second).toMatchObject({ provide: { scopeController: secondRuntime.scope } });
  });
});
