import { injectable, inject } from 'inversify';

import type { FastifyReply, FastifyRequest } from 'fastify';

import { ignoreError } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';
import type { LoggerController } from '#/logger';
import { ApiError, ApiErrorCodes } from '#/error';
import type { ResponseController } from '#/server';
import { type HttpResponse, JSONHttpResponse } from '#/http';

type HttpReplyPromise = (
  request: FastifyRequest,
  options: object,
) => Promise<HttpResponse>;
type HttpOrVoidReplyPromise = (
  request: FastifyRequest,
  options?: object,
) => Promise<HttpResponse | void>;

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
        return await this.responseController.sendResponse(
          request,
          reply,
          response,
        );
      } catch (error) {
        return this.handleError(request, reply, error);
      }
    };
  }

  preHandler(controllerFn: HttpOrVoidReplyPromise, options: object = {}) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const response = await controllerFn(request, options);
        if (response) {
          return await this.responseController.sendResponse(
            request,
            reply,
            response,
          );
        }
      } catch (error) {
        return this.handleError(request, reply, error);
      }
    };
  }

  // MARK: - Error handling
  private logError(request: FastifyRequest, error: any) {
    const isApiError = error instanceof ApiError;
    if (isApiError) {
      this.logger.info('Api Error Response', {
        error: { id: error.identifier, message: error.message },
        metadata: { reqId: request.metadata.reqId },
      });
    } else {
      this.logger.error('Unexpected Error', {
        error: error,
        metadata: { reqId: request.metadata.reqId },
      });
    }
  }

  private async handleError(
    request: FastifyRequest,
    reply: FastifyReply,
    error: Error | unknown,
  ): Promise<void> {
    ignoreError(async () => this.logError(request, error));
    return await this.sendJSONError(request, reply, error);
  }

  private async sendJSONError(
    request: FastifyRequest,
    reply: FastifyReply,
    error: Error | unknown,
  ) {
    const isApiError = error instanceof ApiError;

    const statusCode = isApiError ? error.statusCode : 500;
    const responseMessage = isApiError ? error.message : 'Something went wrong';
    const responseIdentifier = isApiError
      ? error.identifier
      : ApiErrorCodes.Server.INTERNAL_SERVER_ERROR().identifier;

    const data = {
      identifier: responseIdentifier,
      message: responseMessage,
      statusCode: statusCode,
    };

    const response = new JSONHttpResponse({
      statusCode: statusCode,
      data: data,
    });

    return await this.responseController.sendResponse(request, reply, response);
  }
}
