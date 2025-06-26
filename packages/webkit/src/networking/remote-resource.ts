import { injectable } from 'inversify';
import axios from 'axios';

import {
  type AsyncOperation,
  isNonEmptyString,
  isPlainObject,
  isDefinedAndNotNull,
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
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;

      let payload: any = data;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch {
          // No-op
        }
      }

      const details = this.isStringArrayRecord(payload.details) ? payload.details : undefined;

      const fallbackCode = 'UNKNOWN_ERROR';
      const fallbackMessage = 'Something went wrong';

      return new HttpError({
        statusCode: status,
        code: isNonEmptyString(payload?.code) ? payload.code : fallbackCode,
        message: isNonEmptyString(payload?.message) ? payload.message : fallbackMessage,
        details: details,
      });
    }

    return new Error(`[Remote Resource] - An unexpected error occurred: ${error}`);
  }

  private isStringArrayRecord(value: unknown): value is Record<string, string[]> {
    if (!isDefinedAndNotNull(value) || !isPlainObject(value)) return false;

    return Object.values(value).every((arr) => Array.isArray(arr) && arr.every((v) => typeof v === 'string'));
  }
}
