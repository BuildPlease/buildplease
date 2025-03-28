import { inject, injectable } from 'inversify';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { ApikitSymbols } from '#/di';

import type { LoggerController } from '$/logger';

import type { JSONHttpResponse, FileHttpResponse } from '$/http';
import { type HttpResponse, type HttpHeaders, ResponseType } from '$/http';

export interface ResponseController {
  sendResponse(
    request: FastifyRequest,
    reply: FastifyReply,
    response: HttpResponse,
  ): Promise<void>;
}

@injectable()
export class ResponseControllerImpl implements ResponseController {
  constructor(
    @inject(ApikitSymbols.DI.Logger.Controller)
    private logger: LoggerController,
  ) {}

  async sendResponse(
    request: FastifyRequest,
    reply: FastifyReply,
    response: HttpResponse,
  ): Promise<void> {
    switch (response.responseType) {
      case ResponseType.JSON:
        return await this.sendJSONResponse(
          request,
          reply,
          response as JSONHttpResponse,
        );
      case ResponseType.File:
        return await this.sendFileResponse(
          request,
          reply,
          response as FileHttpResponse,
        );
      default:
        throw new Error('Unsupported response type');
    }
  }

  private async sendJSONResponse(
    request: FastifyRequest,
    reply: FastifyReply,
    response: JSONHttpResponse,
  ): Promise<void> {
    const headers = this.createResponseHeaders(response.headers);

    return reply
      .headers(headers)
      .type('application/json')
      .status(response.statusCode || 500)
      .send(response.data);
  }

  private async sendFileResponse(
    request: FastifyRequest,
    reply: FastifyReply,
    response: FileHttpResponse,
  ): Promise<void> {
    const headers = this.createResponseHeaders(response.headers);

    reply.headers(headers).type('text/html').status(response.statusCode);

    try {
      if (response.shouldRender) {
        return reply.view(response.filePath, response.data);
      } else {
        return reply.sendFile(response.filePath);
      }
    } catch (error) {
      this.logger.error('Error sending file response', {
        metadata: { reqId: request.metadata.reqId },
        error: error,
      });
      throw error;
    }
  }

  private createResponseHeaders(responseHeaders?: HttpHeaders): HttpHeaders {
    const baseHeaders: HttpHeaders = {
      'cache-control': 'max-age=3600',
    };
    return { ...baseHeaders, ...(responseHeaders || {}) };
  }
}
