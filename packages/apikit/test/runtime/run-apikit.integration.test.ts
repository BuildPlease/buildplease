import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { type Assembly, type AssemblyContainer, CoreSymbols } from '@buildplease/core';
import { withSelectedEnvironment } from '@buildplease/core/test';
import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  type TemporaryConfigurationProject,
  makeTemporaryConfigurationProject,
} from '#test/fixtures/configuration/temporary-config-project';
import { ApiKitSymbols } from '@/di';
import type { I18nController } from '@/i18n';
import * as ApiKit from '@/index';
import { type RunApiKitOptions, runApiKit } from '@/runtime';
import type { ServerController, ServerPluginExternalHook } from '@/server';

const BUILD = {
  name: {
    original: '@test/example-api',
    base: 'example-api',
  },
  version: '1.7.4',
  id: '019c0000-0000-7000-8000-000000000000',
  createdAt: '2026-07-29T14:00:00.000Z',
} as const;

const CONFIG_SOURCE = `
const config = {
  environments: {
    development: { file: '.env.development', alias: 'beta' },
  },
  input: {
    server: {
      identifier: '@test/example-api:development',
      host: '127.0.0.1',
      port: 30100,
    },
    configurations: [],
  },
};

Object.defineProperty(config, Symbol.for('buildplease.environment-configuration.config'), { value: true });

export default config;
`;

describe('runApiKit', () => {
  let project: TemporaryConfigurationProject | undefined;

  afterEach(async () => {
    vi.restoreAllMocks();
    await project?.cleanup();
    project = undefined;

    Reflect.deleteProperty(globalThis, 'apikit');
  });

  it('owns context loading and the framework/consumer lifecycle order', async () => {
    project = await makeTemporaryConfigurationProject();
    await writeProjectFiles(project);
    vi.spyOn(process, 'cwd').mockReturnValue(project.rootDir);
    const events: string[] = [];
    let closeHook: (() => Promise<void>) | undefined;
    const pluginServer = {} as FastifyInstance;
    const pluginOptions = { marker: 'plugin-options' } as never;
    const i18n: I18nController = {
      prepare: async () => {
        events.push('i18n.prepare');
      },
      parseLocale: () => 'en',
    };
    const server = {
      instance: {
        addHook: (name: string, hook: () => Promise<void>) => {
          expect(name).toBe('onClose');
          events.push('close.register');
          closeHook = hook;
        },
      } as FastifyInstance,
      preparePlugins: async (hook?: ServerPluginExternalHook) => {
        events.push('plugins.early');
        await hook?.(pluginServer, pluginOptions);
        events.push('plugins.late');
      },
      prepare: async () => {
        events.push('server.prepare');
      },
      start: async () => {
        events.push('server.start');
      },
    } satisfies ServerController;
    const consumerAssembly: Assembly = {
      assemble: (container: AssemblyContainer) => {
        expect(global.apikit.environment.name).toBe('development');
        expect(container.isBound(CoreSymbols.DI.Formatter.UnitController)).toBe(true);
        expect(container.isBound(ApiKitSymbols.DI.I18n.Controller)).toBe(true);
        expect(container.isBound(ApiKitSymbols.DI.Server.Controller)).toBe(true);
        events.push('assemblies');
        container.rebind<I18nController>(ApiKitSymbols.DI.I18n.Controller).toConstantValue(i18n);
        container.rebind<ServerController>(ApiKitSymbols.DI.Server.Controller).toConstantValue(server);
      },
    };

    await withSelectedEnvironment('development', async () => {
      await runApiKit({
        hooks: {
          assemblies: () => {
            expect(global.apikit.environment.name).toBe('development');
            events.push('assemblies.hook');
            return [consumerAssembly];
          },
          plugins: ({ scope, server: hookServer, options }) => {
            expect(scope.getInstance<I18nController>(ApiKitSymbols.DI.I18n.Controller)).toBe(i18n);
            expect(hookServer).toBe(pluginServer);
            expect(options).toBe(pluginOptions);
            events.push('plugins.consumer');
          },
          prepare: ({ scope }) => {
            expect(scope.getInstance<I18nController>(ApiKitSymbols.DI.I18n.Controller)).toBe(i18n);
            events.push('consumer.prepare');
          },
          close: ({ scope }) => {
            expect(scope.getInstance<ServerController>(ApiKitSymbols.DI.Server.Controller)).toBe(server);
            events.push('consumer.close');
          },
        },
      });
    });

    expect(global.apikit.build).toEqual(BUILD);
    expect(events).toEqual([
      'assemblies.hook',
      'assemblies',
      'i18n.prepare',
      'plugins.early',
      'plugins.consumer',
      'plugins.late',
      'close.register',
      'server.prepare',
      'consumer.prepare',
      'server.start',
    ]);

    await expect(closeHook?.()).resolves.toBeUndefined();
    expect(events.at(-1)).toBe('consumer.close');
  });

  it('keeps environment selection out of the public options', () => {
    type HasEnvironmentOption = 'environment' extends keyof RunApiKitOptions ? true : false;

    const hasEnvironmentOption: HasEnvironmentOption = false;
    expect(hasEnvironmentOption).toBe(false);
  });

  it('does not expose framework assembly composition publicly', () => {
    expect('apikitAssembly' in ApiKit).toBe(false);
  });
});

async function writeProjectFiles(project: TemporaryConfigurationProject): Promise<void> {
  await project.writeConfig('environment.config.ts', CONFIG_SOURCE);
  await writeFile(join(project.rootDir, '.env.development'), '', 'utf8');

  const buildDir = join(project.rootDir, '.buildplease');
  await mkdir(buildDir, { recursive: true });
  await writeFile(join(buildDir, 'build.ts'), `export const Build = ${JSON.stringify(BUILD, null, 2)};\n`, 'utf8');
  await writeFile(
    join(buildDir, 'environment.ts'),
    "export enum Environment { development = 'development' }\n" +
      "export const Environments = { development: { name: Environment.development, alias: 'beta' } } as const;\n",
    'utf8',
  );
}
