import { type AsyncOperation, delay } from '@buildplease/core';
import {
  type HttpClient,
  type HttpRequest,
  type RemoteEndpoint,
  HttpError,
  SecuredRemoteResource,
} from '@buildplease/webkit';
import { inject, injectable } from 'inversify';

import { AppSymbols } from '~/symbols';

export enum HttpRequestTestMode {
  Success,
  Unauthorized,
  Error,
}

export enum HttpRequestTestErrorCode {
  Unauthorized = 'playground_unauthorized',
  Error = 'playground_error',
}

export interface HttpRequestTestInput {
  index: number;
  delayMs: number;
  mode: HttpRequestTestMode;
  onRequestStart?: () => void;
  onResponse?: (mode: HttpRequestTestMode) => void;
}

export interface HttpRequestTestOutput {
  index: number;
  message: string;
}

export type HttpRequestTestOperation = AsyncOperation<HttpRequestTestInput, HttpRequestTestOutput>;

@injectable()
export class HttpRequestTestEndpoint implements RemoteEndpoint<
  HttpRequestTestInput,
  HttpRequestTestInput,
  HttpRequestTestOutput,
  HttpRequestTestOutput
> {
  public async convertInput(input: HttpRequestTestInput): Promise<HttpRequestTestInput> {
    return input;
  }

  public makeRequest(input: HttpRequestTestInput): HttpRequest<HttpRequestTestOutput> {
    return {
      execute: async () => {
        input.onRequestStart?.();
        await delay(input.delayMs);
        input.onResponse?.(input.mode);

        switch (input.mode) {
          case HttpRequestTestMode.Unauthorized:
            throw new HttpError({
              statusCode: 401,
              code: HttpRequestTestErrorCode.Unauthorized,
              message: `Unauthorized at ${input.index}`,
            });
          case HttpRequestTestMode.Error:
            throw new HttpError({
              statusCode: 500,
              code: HttpRequestTestErrorCode.Error,
              message: `Error at ${input.index}`,
            });
          case HttpRequestTestMode.Success:
            return {
              index: input.index,
              message: `Success ${input.index}`,
            };
        }
      },
    };
  }

  public async convertOutput(output: HttpRequestTestOutput): Promise<HttpRequestTestOutput> {
    return output;
  }
}

@injectable()
export class HttpRequestTestResource extends SecuredRemoteResource<HttpRequestTestInput, HttpRequestTestOutput> {
  public constructor(
    @inject(HttpRequestTestEndpoint) endpoint: HttpRequestTestEndpoint,
    @inject(AppSymbols.DI.Networking.HttpRequestTestClient) httpClient: HttpClient,
  ) {
    super(endpoint, httpClient);
  }
}

@injectable()
export class DelayedHttpRequestTestResource extends SecuredRemoteResource<HttpRequestTestInput, HttpRequestTestOutput> {
  public constructor(
    @inject(HttpRequestTestEndpoint) endpoint: HttpRequestTestEndpoint,
    @inject(AppSymbols.DI.Networking.DelayedHttpRequestTestClient) httpClient: HttpClient,
  ) {
    super(endpoint, httpClient);
  }
}
