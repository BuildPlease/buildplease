import { inject, injectable } from 'inversify';
import type { FastifyInstance, FastifyBaseLogger } from 'fastify';
import Fastify from 'fastify';

import Plugins from './plugins';

import { ApiKitSymbols } from '#/di';
import type { LoggerController } from '#/logger';
import { ApiError, ApiErrorFactory } from '#/error';
import type { ApiKitController } from '#/configuration';

// MARK: - Plugins Options
export interface ServerPluginBaseOptions {
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
      loggerController: this.logger,
      apikitController: this.configuration,
    };

    // MARK: - 1. Core internal plugins (must run before external)
    const earlyInternalPlugins = [Plugins.cookie, Plugins.ip, Plugins.metadata, Plugins.scope];
    for (const plugin of earlyInternalPlugins) {
      await this.server.register(plugin, options);
    }

    // MARK: - 2. External app-specific plugins (e.g., CORS, Auth, etc.)
    await registerExternal(this.server);

    // MARK: - 3. UI/static late plugins (can run after external)
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
    const { port, host } = this.configuration.server;

    await this.server.ready();
    await this.server.listen({ port: port, host: host });

    this.logger.info(`Server started on ${host}:${port}`);
  }

  // MARK: - Private

  private async configureErrorHandler(): Promise<void> {
    this.server.setErrorHandler(async (error, request, reply) => {
      const isValidationError = Array.isArray(error.validation);
      const isInternalError = !error.statusCode || error.statusCode === 500;
      const internalError = ApiErrorFactory.make('Server.INTERNAL_SERVER_ERROR');

      const handleApiError = (apiError: ApiError) => {
        reply.status(apiError.statusCode).send(apiError.toJSON());
      };

      const handleValidationError = () => {
        const validationError = ApiErrorFactory.make('Validation.BAD_REQUEST');
        const statusCode = error.statusCode || validationError.statusCode;
        const response = ApiError.with({
          statusCode: statusCode,
          code: validationError.code,
          message: error.message,
        }).toJSON();

        reply.status(statusCode).send(response);
      };

      const handleInternalError = () => {
        this.logger.error('Internal Server Error', {
          metadata: { requestId: request.metadata.requestId },
          error: error,
        });
        reply.status(500).send(internalError);
      };

      const handleError = () => {
        const statusCode = error.statusCode || 500;
        const response = ApiError.with({
          statusCode: statusCode,
          code: error.code || error.name || internalError.code,
          message: error.message || internalError.message,
        }).toJSON();

        reply.status(statusCode).send(response);
      };

      if (error instanceof ApiError) {
        return handleApiError(error);
      } else if (isValidationError) {
        return handleValidationError();
      } else if (isInternalError) {
        return handleInternalError();
      } else {
        return handleError();
      }
    });
  }

  private async configureShutdownHandler(hook?: () => Promise<void>): Promise<void> {
    type ShutdownSignal = NodeJS.Signals;
    type ShutdownErrorEvent = 'uncaughtException' | 'unhandledRejection';
    type ShutdownEvent = ShutdownSignal | ShutdownErrorEvent;

    const shutdown = async (reason: ShutdownEvent, error?: unknown) => {
      this.logger.warn(`⛔ Shutdown: ${reason}`);

      if (hook) {
        try {
          await hook();
        } catch (err) {
          this.logger.error('⚠️ Shutdown hook failed', { error: err });
        }
      }

      try {
        await this.server.close();
        this.logger.info('✅ Server closed');
      } catch (err) {
        this.logger.error('❌ Server close failed', { error: err });
      }

      if (error) {
        this.logger.error('🚨 Fatal error during shutdown', { error });
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
