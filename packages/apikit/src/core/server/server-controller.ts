import { inject, injectable } from 'inversify';
import type { FastifyInstance, FastifyBaseLogger } from 'fastify';
import Fastify from 'fastify';

import * as Plugins from './plugins';

import { ApiKitSymbols } from '#/di';
import type { LoggerController } from '#/logger';
import { ApiError, ApiErrorCodes } from '#/error';
import type { ApiKitConfigurationController } from '#/configuration';

// MARK: - Plugins Options
export interface ServerPluginBaseOptions {
  loggerController: LoggerController;
  apikitController: ApiKitConfigurationController;
}

export type ServerPluginOptions<TExtras extends object = {}> =
  ServerPluginBaseOptions & TExtras;

export interface ServerController {
  get instance(): FastifyInstance;
  prepare(): Promise<void>;
  start(): Promise<void>;
}

@injectable()
export class ServerControllerImpl implements ServerController {
  private server: FastifyInstance;

  constructor(
    @inject(ApiKitSymbols.DI.Logger.Controller)
    private logger: LoggerController,
    @inject(ApiKitSymbols.DI.Configuration.Controller)
    private configuration: ApiKitConfigurationController,
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

  public async prepare(): Promise<void> {
    await this.configureErrorHandler();
    await this.configurePlugins();
  }

  public async start(): Promise<void> {
    const { port, host } = this.configuration.server;

    await this.setupServerHandlers();
    await this.server.ready();
    await this.server.listen({ port: port, host: host });

    this.logger.info(`Server started on ${host}:${port}`);
  }

  // MARK: - Private

  private async configurePlugins(): Promise<void> {
    const options: ServerPluginOptions = {
      loggerController: this.logger,
      apikitController: this.configuration,
    };

    for (const plugin of Object.values(Plugins)) {
      await this.server.register(plugin, options);
    }
  }

  private async configureErrorHandler(): Promise<void> {
    this.server.setErrorHandler(async (error, request, reply) => {
      const isInternalError = !error.statusCode || error.statusCode === 500;
      const internalServerError = ApiErrorCodes.Server.INTERNAL_SERVER_ERROR();

      const handleInternalError = () => {
        this.logger.error('Internal Server Error', {
          metadata: { reqId: request.metadata.reqId },
          error: error,
        });
        reply.status(500).send(internalServerError);
      };

      const handleCommonError = () => {
        const statusCode = error.statusCode || 500;
        reply.status(statusCode).send({
          statusCode: statusCode,
          identifier:
            error.code || error.name || internalServerError.identifier,
          message: error.message || internalServerError.message,
        });
      };

      const handleApiError = (apiError: ApiError) => {
        reply.status(apiError.statusCode).send(apiError.toJSON());
      };

      if (error instanceof ApiError) {
        return handleApiError(error);
      } else if (isInternalError) {
        return handleInternalError();
      } else {
        return handleCommonError();
      }
    });
  }

  private async setupServerHandlers(): Promise<void> {
    const shutdown = async (signal: string, reason: string) => {
      this.logger.warn(`Received ${signal}, shutting down gracefully`);
      await this.server.close();
      this.logger.fatal(`Server shutting down due to: ${reason}`);
      process.exit();
    };

    ['SIGINT', 'SIGTERM', 'uncaughtException', 'unhandledRejection'].forEach(
      (event) => {
        process.on(event, async (err) => {
          await shutdown(event, err);
        });
      },
    );
  }
}
