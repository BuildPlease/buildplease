import { ignoreErrorAsync } from '@meawkit/core';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { inject, injectable } from 'inversify';

import { ApiKitSymbols } from '@/di';
import { ApiError } from '@/error';
import { type HttpResponse } from '@/http';
import { type LoggerController, LogFlag } from '@/logger';
import type { ResponseController } from '@/server';

const LOG_PREFIX = '[ApiKit:Request]';

type HttpReplyPromise = (request: FastifyRequest, options: object) => Promise<HttpResponse>;
type HttpOrVoidReplyPromise = (request: FastifyRequest, options?: object) => Promise<HttpResponse | void>;

export interface RequestController {
  handler(
    controllerFn: HttpReplyPromise,
    options?: object,
  ): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  preHandler(
    controllerFn: HttpOrVoidReplyPromise,
    options?: object,
  ): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
}

@injectable()
export class RequestControllerImpl implements RequestController {
  constructor(
    @inject(ApiKitSymbols.DI.Logger.Controller)
    private logger: LoggerController,
    @inject(ApiKitSymbols.DI.Server.ResponseController)
    private responseController: ResponseController,
  ) {}

  handler(controllerFn: HttpReplyPromise, options: object = {}) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const response = await controllerFn(request, options);
        return await this.responseController.sendResponse(request, reply, response);
      } catch (error) {
        await this.logError(request, error);
        throw error;
      }
    };
  }

  preHandler(controllerFn: HttpOrVoidReplyPromise, options: object = {}) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const response = await controllerFn(request, options);
        if (response) {
          return await this.responseController.sendResponse(request, reply, response);
        }
      } catch (error) {
        await this.logError(request, error);
        throw error;
      }
    };
  }

  // MARK: - Private

  private async logError(request: FastifyRequest, error: unknown): Promise<void> {
    await ignoreErrorAsync(() => {
      const requestId = request.metadata.requestId;

      if (error instanceof ApiError) {
        this.logger.info(`${LOG_PREFIX} Api error response`, { error: error, metadata: { requestId: requestId } });
      } else {
        this.logger.error(`${LOG_PREFIX} Unexpected error`, {
          flag: LogFlag.Important,
          error: error,
          metadata: { requestId: requestId },
        });
      }
    });
  }
}
