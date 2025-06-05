import { injectable } from 'inversify';

import {
  type AsyncOperation,
  isDefined,
  isDefinedAndNotNull,
  isNonEmptyString,
  emptyOrUndefinedStringToNull,
} from '@nidavellirx/meowv-core';

import { type RemoteEndpoint, type RequestConfig, type RequestInterceptor, HttpError } from '@/networking';

@injectable()
export class RemoteResource<Input, Output, Endpoint extends RemoteEndpoint<Input, unknown, Output, unknown>>
  implements AsyncOperation<Input, Output>
{
  protected interceptors: Set<RequestInterceptor> = new Set();

  constructor(private endpoint: Endpoint) {}

  public async execute(input: Input, options?: RequestConfig): Promise<Output> {
    try {
      const inputDto = await this.endpoint.convertInput(input);

      let config: RequestConfig = {
        ...options,
      };

      for (const interceptor of this.interceptors) {
        config = interceptor.intercept(config);
      }

      const response = await this.endpoint.makeRequest(inputDto, config);
      const outputDto = await this.endpoint.convertOutput(response);

      return outputDto;
    } catch (error) {
      throw this.parseError(error);
    }
  }

  public parseError(error: unknown): Error {
    // MARK: - 1) get HTTP status (axios.response.status or direct .status)
    const statusCode =
      this.getNestedProperty<number>(error, 'response.status') ??
      this.getNestedProperty<number>(error, 'status');

    // MARK: - 2) get JSON body, if any
    const payload = this.getNestedProperty<Record<string, any>>(error, 'response.data');

    // MARK: - 3) require status + code + message
    if (
      isDefined(statusCode) &&
      isDefinedAndNotNull(payload) &&
      isNonEmptyString(payload.code) &&
      isNonEmptyString(payload.message)
    ) {
      return new HttpError({
        statusCode,
        code: payload.code,
        message: payload.message,
        details: emptyOrUndefinedStringToNull(payload.details),
      });
    }

    // MARK: - 4) fallback
    return new Error(`An unexpected error occurred: ${error}`);
  }

  private getNestedProperty<T = unknown>(obj: unknown, path: string): T | undefined {
    return path.split('.').reduce((acc, key) => {
      if (acc && typeof acc === 'object') {
        return (acc as any)[key];
      }
      return undefined;
    }, obj) as T | undefined;
  }
}
