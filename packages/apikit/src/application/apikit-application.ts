import { type Assembly, type Awaitable, coreAssembly, ScopeController } from '@buildplease/core';
import { CoreApplication } from '@buildplease/core/node';
import { initializeApiKitConfiguration } from '@src-internal/configuration/initialize-configuration';
import { apikitAssembly } from '@src-internal/di';
import type { FastifyInstance } from 'fastify';

import { ApiKitSymbols } from '@/di';
import type { I18nController } from '@/i18n';
import type { ServerController, ServerPluginOptions } from '@/server';

/** Startup context. */
export interface ApiKitApplicationContext {
  readonly scope: ScopeController;
}

/** Plugin registration context. */
export interface ApiKitApplicationPluginContext extends ApiKitApplicationContext {
  readonly server: FastifyInstance;
  readonly options: ServerPluginOptions;
}

/** Startup options. */
export interface ApiKitApplicationOptions {
  readonly assemblies?: () => Assembly[];
  readonly plugins?: (context: ApiKitApplicationPluginContext) => Awaitable<void>;
  readonly prepare?: (context: ApiKitApplicationContext) => Awaitable<void>;
  readonly close?: (context: ApiKitApplicationContext) => Awaitable<void>;
}

/** Runs application startup. */
export class ApiKitApplication {
  /**
   * Runs application startup.
   *
   * @param options - Startup options.
   * @returns Resolves when startup completes.
   */
  public static async run(options: ApiKitApplicationOptions = {}): Promise<void> {
    await CoreApplication.run(async () => {
      await initializeApiKitConfiguration();

      const scope = new ScopeController();
      const consumerAssemblies = options.assemblies?.() ?? [];

      await scope.registerAssemblies([...coreAssembly(), ...apikitAssembly(), ...consumerAssemblies]);

      const i18n = scope.getInstance<I18nController>(ApiKitSymbols.DI.I18n.Controller);
      const server = scope.getInstance<ServerController>(ApiKitSymbols.DI.Server.Controller);
      const context: ApiKitApplicationContext = { scope: scope };

      await i18n.prepare();

      const plugins = options.plugins;
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

      const close = options.close;
      if (close) {
        server.instance.addHook('onClose', async () => close(context));
      }

      await server.prepare();
      await options.prepare?.(context);
      await server.start();
    });
  }
}
