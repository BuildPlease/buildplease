import Fastify, { type FastifyBaseLogger, type FastifyInstance } from 'fastify';
import { inject, injectable } from 'inversify';

import type { ApiKitController } from '@/configuration';
import { ApiKitSymbols } from '@/di';
import { ApiError, ApiErrorCodes, ApiErrorFactory } from '@/error';
import type { I18nController } from '@/i18n';
import { type LoggerController, LogFlag } from '@/logger';

import { FastifyPlugins } from './plugins';

const LOG_PREFIX = '[Server]';

// MARK: - Plugin Options

export interface ServerPluginBaseOptions {
  i18nController: I18nController;
  loggerController: LoggerController;
  apikitController: ApiKitController;
}

export type ServerPluginOptions<TExtras extends object = {}> = ServerPluginBaseOptions & TExtras;

export type ServerPluginExternalHook = (instance: FastifyInstance, options: ServerPluginOptions) => Promise<void>;

export interface ServerController {
  get instance(): FastifyInstance;

  preparePlugins(externalHook?: ServerPluginExternalHook): Promise<void>;

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

  public async preparePlugins(externalHook: ServerPluginExternalHook = async () => {}): Promise<void> {
    const options: ServerPluginOptions = {
      i18nController: this.i18n,
      loggerController: this.logger,
      apikitController: this.configuration,
    };

    const earlyPlugins = [
      FastifyPlugins.cookie,
      FastifyPlugins.ip,
      FastifyPlugins.requestMetadata,
      FastifyPlugins.requestScope,
      FastifyPlugins.requestLogger,

      FastifyPlugins.cors,
      FastifyPlugins.multipart,
      FastifyPlugins.basicAuth,
      FastifyPlugins.health,
      FastifyPlugins.metrics,
    ] as const;

    const latePlugins = [FastifyPlugins.staticFiles, FastifyPlugins.view] as const;

    for (const plugin of earlyPlugins) {
      await this.server.register(plugin, options);
    }

    await externalHook(this.server, options);

    for (const plugin of latePlugins) {
      await this.server.register(plugin, options);
    }
  }

  public async prepare(shutdownHook?: () => Promise<void>): Promise<void> {
    await this.configureErrorHandler();
    await this.configureShutdownHandler(shutdownHook);
  }

  public async start(): Promise<void> {
    const host = this.configuration.server.host;
    const port = this.configuration.server.port;

    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
      throw new Error(`Invalid server port "${port}", must be an integer 1-65535.`);
    }

    await this.server.ready();
    await this.server.listen({
      host: host,
      port: port,
      listenTextResolver: (address) => `${LOG_PREFIX} Listening at ${address}`,
    });

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
      const internalError = ApiErrorFactory.make(ApiErrorCodes.Server.INTERNAL_SERVER_ERROR.message);

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
          const validationError = ApiErrorFactory.make(ApiErrorCodes.Validation.BAD_REQUEST.message);
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
      this.logger.warn(`${LOG_PREFIX} ⛔ Shutdown: ${reason}`);

      if (hook) {
        try {
          await hook();
        } catch (error) {
          this.logger.error(`${LOG_PREFIX} ⚠️ Shutdown hook failed`, { error: error });
        }
      }

      try {
        await this.server.close();
        this.logger.info(`${LOG_PREFIX} ✅ Closed`);
      } catch (err) {
        this.logger.error(`${LOG_PREFIX} ❌ Close failed`, { error: err });
      }

      if (error) {
        this.logger.error(`${LOG_PREFIX} 🚨 Fatal error during shutdown`, { error });
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
