import { injectable } from 'inversify';

import { AsyncOperation } from '@nidavellirx/meowv-core';

import {
  type RemoteEndpoint,
  type RequestConfig,
  type RequestInterceptor,
  HttpError,
  HttpClient,
} from '@/networking';

@injectable()
export class RemoteResource<
  Input,
  Output,
  Endpoint extends RemoteEndpoint<Input, unknown, Output, unknown>,
> implements AsyncOperation<Input, Output>
{
  protected interceptors: Set<RequestInterceptor> = new Set();

  constructor(
    private client: HttpClient,
    private endpoint: Endpoint,
  ) {}

  public async execute(input: Input, options?: RequestConfig): Promise<Output> {
    try {
      const inputDto = await this.endpoint.convertInput(input);
      const request = await this.endpoint.makeRequest(inputDto);

      let config: RequestConfig = {
        ...request,
        ...options,
      };

      for (const interceptor of this.interceptors) {
        config = interceptor.intercept(config);
      }

      const response = await this.client.request(config);
      const outputDto = await this.endpoint.convertOutput(response);

      return outputDto;
    } catch (error) {
      throw this.parseError(error);
    }
  }

  public parseError(error: unknown): Error {
    const statusCode =
      this.getNestedProperty<number>(error, 'response.status') ??
      this.getNestedProperty<number>(error, 'status');

    const responseMessage =
      this.getNestedProperty<string>(error, 'response.data.message') ??
      this.getNestedProperty<string>(error, 'message');

    if (statusCode) {
      return new HttpError(statusCode, responseMessage);
    }

    return new Error('An unexpected error occurred');
  }

  private getNestedProperty<T = unknown>(
    obj: unknown,
    path: string,
  ): T | undefined {
    return path.split('.').reduce((acc, key) => {
      if (acc && typeof acc === 'object') {
        return (acc as any)[key];
      }
      return undefined;
    }, obj) as T | undefined;
  }
}
