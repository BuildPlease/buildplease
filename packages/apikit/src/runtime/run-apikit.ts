import { type Assembly, type Awaitable, coreAssembly, ScopeController } from '@buildplease/core';
import { initializeApiKitConfiguration } from '@src-internal/configuration/initialize-configuration';
import { apikitAssembly } from '@src-internal/di';
import type { FastifyInstance } from 'fastify';

import { ApiKitSymbols } from '@/di';
import type { I18nController } from '@/i18n';
import type { ServerController, ServerPluginOptions } from '@/server';

export interface ApiKitRuntimeHookContext {
  readonly scope: ScopeController;
}

export interface ApiKitRuntimePluginHookContext extends ApiKitRuntimeHookContext {
  readonly server: FastifyInstance;
  readonly options: ServerPluginOptions;
}

export interface ApiKitRuntimeHooks {
  readonly assemblies?: () => Assembly[];
  readonly plugins?: (context: ApiKitRuntimePluginHookContext) => Awaitable<void>;
  readonly prepare?: (context: ApiKitRuntimeHookContext) => Awaitable<void>;
  readonly close?: (context: ApiKitRuntimeHookContext) => Awaitable<void>;
}

export interface RunApiKitOptions {
  readonly hooks?: ApiKitRuntimeHooks;
}

export async function runApiKit(options: RunApiKitOptions = {}): Promise<void> {
  await initializeApiKitConfiguration();

  const scope = new ScopeController();
  const consumerAssembly = options.hooks?.assemblies?.() ?? [];

  await scope.registerAssemblies([...coreAssembly(), ...apikitAssembly(), ...consumerAssembly]);

  const i18n = scope.getInstance<I18nController>(ApiKitSymbols.DI.I18n.Controller);
  const server = scope.getInstance<ServerController>(ApiKitSymbols.DI.Server.Controller);
  const hookContext: ApiKitRuntimeHookContext = { scope: scope };

  await i18n.prepare();

  const plugins = options.hooks?.plugins;
  await server.preparePlugins(
    plugins
      ? async (instance, pluginOptions) =>
          plugins({
            scope: scope,
            server: instance,
            options: pluginOptions,
          })
      : undefined,
  );

  const close = options.hooks?.close;

  if (close) {
    server.instance.addHook('onClose', async () => close(hookContext));
  }

  await server.prepare();
  await options.hooks?.prepare?.(hookContext);
  await server.start();
}
