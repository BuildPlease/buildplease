import type { FastifyReply, FastifyRequest } from 'fastify';
import { inject, injectable } from 'inversify';

import { ApiKitSymbols } from '@/di';
import { type FileHttpResponse, type HttpResponse, type JSONHttpResponse, HttpHeaders, ResponseType } from '@/http';
import type { LoggerController } from '@/logger';

const LOG_PREFIX = '[ApiKit:Response]';

export interface ResponseController {
  sendResponse(request: FastifyRequest, reply: FastifyReply, response: HttpResponse): Promise<void>;
}

@injectable()
export class ResponseControllerImpl implements ResponseController {
  constructor(
    @inject(ApiKitSymbols.DI.Logger.Controller)
    private logger: LoggerController,
  ) {}

  async sendResponse(request: FastifyRequest, reply: FastifyReply, response: HttpResponse): Promise<void> {
    switch (response.responseType) {
      case ResponseType.JSON:
        return await this.sendJSONResponse(request, reply, response as JSONHttpResponse);
      case ResponseType.File:
        return await this.sendFileResponse(request, reply, response as FileHttpResponse);
      default:
        throw new Error(`${LOG_PREFIX} Unsupported response type`);
    }
  }

  private async sendJSONResponse(
    _request: FastifyRequest,
    reply: FastifyReply,
    response: JSONHttpResponse,
  ): Promise<void> {
    const headers = this.createResponseHeaders(response.headers);

    return reply.headers(headers).type('application/json').status(response.statusCode).send(response.data);
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
        const html = await reply.viewAsync(response.filePath, response.data);
        return reply.send(html);
      } else {
        return reply.sendFile(response.filePath);
      }
    } catch (error) {
      const requestId = request.metadata.requestId;
      this.logger.error(`${LOG_PREFIX} File response failed`, { error: error, metadata: { requestId: requestId } });

      throw error;
    }
  }

  private createResponseHeaders(responseHeaders?: HttpHeaders): HttpHeaders {
    const baseHeaders: HttpHeaders = {
      [HttpHeaders.cacheControl]: 'no-store',
    };

    return { ...baseHeaders, ...(responseHeaders || {}) };
  }
}
