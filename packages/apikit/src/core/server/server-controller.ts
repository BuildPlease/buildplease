import { inject, injectable } from 'inversify';
import Fastify, { type FastifyInstance, type FastifyBaseLogger } from 'fastify';

import Plugins from './plugins';

import { ApiKitSymbols } from '#/di';
import type { I18nController } from '#/i18n';
import { type LoggerController, LogFlag } from '#/logger';
import { ApiError, ApiErrorFactory } from '#/error';
import type { ApiKitController } from '#/configuration';

const LOG_PREFIX = '[Server]';

// MARK: - Plugins Options
export interface ServerPluginBaseOptions {
  i18nController: I18nController;
  loggerController: LoggerController;
  apikitController: ApiKitController;
}

export type ServerPluginOptions<TExtras extends object = {}> = ServerPluginBaseOptions & TExtras;

export interface ServerController {
  get instance(): FastifyInstance;
  preparePlugins(registerExternal?: (instance: FastifyInstance) => Promise<void>): Promise<void>;
  prepare(shutdownHook?: () => Promise<void>): Promise<void>;
  start(): Promise<void>;
}

@injectable()
export class ServerControllerImpl implements ServerController {
  private server: FastifyInstance;

  constructor(
    @inject(ApiKitSymbols.DI.I18n.Controller)
    private i18n: I18nController,
    @inject(ApiKitSymbols.DI.Logger.Controller)
    private logger: LoggerController,
    @inject(ApiKitSymbols.DI.Configuration.Controller)
    private configuration: ApiKitController,
  ) {
    this.server = Fastify({
      disableRequestLogging: true,
      loggerInstance: this.logger.instance as FastifyBaseLogger,
      ajv: {
        customOptions: {
          strict: true,
          keywords: ['example'],
        },
      },
      trustProxy: this.configuration.server.trustProxy,
    });
  }

  // MARK: - Public

  public get instance(): FastifyInstance {
    return this.server;
  }

  public async preparePlugins(
    registerExternal: (instance: FastifyInstance) => Promise<void> = async () => {},
  ): Promise<void> {
    const options: ServerPluginOptions = {
      i18nController: this.i18n,
      loggerController: this.logger,
      apikitController: this.configuration,
    };

    // MARK: 1. Core internal plugins (must run before external)
    const earlyInternalPlugins = [
      Plugins.cookie,
      Plugins.ip,
      Plugins.metadata,
      Plugins.scope,
      Plugins.logger,
    ];
    for (const plugin of earlyInternalPlugins) {
      await this.server.register(plugin, options);
    }

    // MARK: 2. External app-specific plugins (e.g., CORS, Auth, etc.)
    await registerExternal(this.server);

    // MARK: 3. UI/static late plugins (can run after external)
    const lateInternalPlugins = [Plugins.staticFiles, Plugins.view];
    for (const plugin of lateInternalPlugins) {
      await this.server.register(plugin, options);
    }
  }

  public async prepare(shutdownHook?: () => Promise<void>): Promise<void> {
    await this.configureErrorHandler();
    await this.configureShutdownHandler(shutdownHook);
  }

  public async start(): Promise<void> {
    const rawHost = process.env.SERVER_HOST;
    const rawPort = process.env.SERVER_PORT;

    if (!rawHost) throw new Error('Missing required environment variable: SERVER_HOST');
    if (!rawPort) throw new Error('Missing required environment variable: SERVER_PORT');

    const host = rawHost;
    const port = Number(rawPort);

    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
      throw new Error(`Invalid SERVER_PORT "${rawPort}", must be an integer 1-65535`);
    }

    await this.server.ready();
    await this.server.listen({ port, host });

    this.logger.info(`${LOG_PREFIX} Debug mode ${this.configuration.isDebug ? 'ON' : 'OFF'}`);
    this.logger.info(`${LOG_PREFIX} Started on ${host}:${port}`);
  }

  // MARK: - Private

  private async configureErrorHandler(): Promise<void> {
    this.server.setErrorHandler<{
      statusCode?: number;
      code?: string;
      validation?: unknown[];
      validationContext?: unknown;
      name?: string;
      message?: string;
    }>(async (error, request, reply) => {
      const isValidationError = Array.isArray(error.validation);
      const isInternalError = !error.statusCode || error.statusCode === 500;
      const internalError = ApiErrorFactory.make('Server.INTERNAL_SERVER_ERROR');

      if (this.configuration.isDebug) {
        this.logger.debug(`${LOG_PREFIX} Error Handler:`, { error });
      }

      switch (true) {
        // MARK: - ApiError (domain/business)
        case error instanceof ApiError: {
          return reply.status(error.statusCode).send(error.toJSON());
        }

        // MARK: - Validation (AJV/Fastify)
        case isValidationError: {
          const validationError = ApiErrorFactory.make('Validation.BAD_REQUEST');
          const statusCode = error.statusCode || validationError.statusCode;

          const response = new ApiError({
            statusCode: statusCode,
            code: validationError.code,
            message: validationError.message,
          });

          return reply.status(statusCode).send(response.toJSON());
        }

        // MARK: - Internal (500 / missing statusCode)
        case isInternalError: {
          this.logger.error(`${LOG_PREFIX} Internal Server Error`, {
            flag: LogFlag.Important,
            metadata: { requestId: request.metadata.requestId },
            error: error,
          });

          return reply.status(500).send(internalError.toJSON());
        }

        // MARK: - Generic
        default: {
          const statusCode = error.statusCode || 500;

          const response = new ApiError({
            statusCode: statusCode,
            code: error.code || error.name || internalError.code,
            message: error.message || internalError.message,
          });

          return reply.status(statusCode).send(response.toJSON());
        }
      }
    });
  }

  private async configureShutdownHandler(hook?: () => Promise<void>): Promise<void> {
    type ShutdownSignal = NodeJS.Signals;
    type ShutdownErrorEvent = 'uncaughtException' | 'unhandledRejection';
    type ShutdownEvent = ShutdownSignal | ShutdownErrorEvent;

    const shutdown = async (reason: ShutdownEvent, error?: unknown) => {
      this.logger.warn(`⛔ ${LOG_PREFIX} Shutdown: ${reason}`);

      if (hook) {
        try {
          await hook();
        } catch (error) {
          this.logger.error(`⚠️ ${LOG_PREFIX} Shutdown hook failed`, { error: error });
        }
      }

      try {
        await this.server.close();
        this.logger.info(`✅ ${LOG_PREFIX} Closed`);
      } catch (err) {
        this.logger.error(`❌ ${LOG_PREFIX} Close failed`, { error: err });
      }

      if (error) {
        this.logger.error(`🚨 ${LOG_PREFIX} Fatal error during shutdown`, { error });
      }

      process.exit(error ? 1 : 0);
    };

    const events: [ShutdownEvent, (arg: any) => void][] = [
      ['SIGINT', () => shutdown('SIGINT')],
      ['SIGTERM', () => shutdown('SIGTERM')],
      ['uncaughtException', (err) => shutdown('uncaughtException', err)],
      ['unhandledRejection', (err) => shutdown('unhandledRejection', err)],
    ];

    for (const [event, handler] of events) {
      process.on(event, handler as any);
    }
  }
}
