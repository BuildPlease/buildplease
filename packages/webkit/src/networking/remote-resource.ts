import { injectable, unmanaged } from 'inversify';
import axios from 'axios';

import {
  type AsyncOperation,
  TimeoutError,
  NetworkError,
  CanceledError,
  ConversionError,
  UnknownError,
  isNonEmptyString,
  isPlainObject,
  isDefinedAndNotNull,
  ignoreError,
} from '@meawkit/core';

import {
  type RemoteEndpoint,
  type RemoteRequestConfig,
  type RemoteRequestInterceptor,
  type HttpErrorOptions,
  HttpError,
  InterceptorSet,
  CookieInterceptor,
} from '@/networking';

const FALLBACK_CODE = 'UNKNOWN_ERROR';
const FALLBACK_MESSAGE = 'Unknown Error';

@injectable()
export abstract class BaseRemoteResource<
  Input,
  Output,
  Endpoint extends RemoteEndpoint<Input, unknown, Output, unknown>,
> implements AsyncOperation<Input, Output> {
  protected readonly interceptors = new InterceptorSet();

  constructor(
    @unmanaged()
    protected readonly endpoint: Endpoint,
  ) {
    this.use(new CookieInterceptor());
  }

  // MARK: - Interceptors

  protected use(...items: RemoteRequestInterceptor[]): this {
    this.interceptors.add(...items);
    return this;
  }

  protected removeInterceptor(item: RemoteRequestInterceptor): this {
    this.interceptors.remove(item);
    return this;
  }

  protected clearInterceptors(): this {
    this.interceptors.clear();
    return this;
  }

  // MARK: - Execution

  public async execute(input: Input, options?: RemoteRequestConfig): Promise<Output> {
    try {
      // 1) Convert input
      const inputDto = await this.convertOrThrow(() => this.endpoint.convertInput(input));

      // 2) Apply interceptors
      let config: RemoteRequestConfig = { ...options };
      for (const interceptor of this.interceptors.list()) {
        config = interceptor.intercept(config);
      }

      // 3) Execute request
      const response = await this.endpoint.makeRequest(inputDto, config);

      // 4) Convert output
      const outputDto = await this.convertOrThrow(() => this.endpoint.convertOutput(response));

      return outputDto;
    } catch (error) {
      throw this.parseError(error);
    }
  }

  protected parseError(error: unknown): Error {
    // MARK: - Keep already-normalized errors
    if (
      error instanceof HttpError ||
      error instanceof TimeoutError ||
      error instanceof NetworkError ||
      error instanceof CanceledError ||
      error instanceof ConversionError ||
      error instanceof UnknownError
    ) {
      return error;
    }

    // MARK: - Canceled (ERR_CANCELED)
    if (
      axios.isCancel?.(error) ||
      (axios.isAxiosError(error) && (error.code === 'ERR_CANCELED' || error.message === 'canceled'))
    ) {
      return new CanceledError({ cause: error });
    }

    // MARK: - Timeout (ECONNABORTED)
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      return new TimeoutError({ cause: error });
    }

    // MARK: - No response (offline/DNS/CORS)
    if (axios.isAxiosError(error) && !error.response) {
      return new NetworkError({ message: error.message, cause: error });
    }

    // MARK: - HttpError
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;

      let payload: any = data;
      if (typeof payload === 'string') {
        payload = ignoreError(() => JSON.parse(payload as string)).orDefault(payload);
      }

      const details = this.isStringArrayRecord(payload.details) ? payload.details : undefined;
      const options: HttpErrorOptions = this.buildHttpErrorOptions(status, payload, details);
      return new HttpError(options);
    }

    // Fallback: Unknown
    const message = error instanceof Error ? error.message : FALLBACK_MESSAGE;
    return new UnknownError({ message: message, cause: error });
  }

  protected async convertOrThrow<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      throw new ConversionError({ cause: error });
    }
  }

  // MARK: - Private

  private isStringArrayRecord(value: unknown): value is Record<string, string[]> {
    if (!isDefinedAndNotNull(value) || !isPlainObject(value)) return false;
    return Object.values(value).every((v) => Array.isArray(v) && v.every((i) => typeof i === 'string'));
  }

  private buildHttpErrorOptions(
    statusCode: number,
    payload: any,
    details?: Record<string, string[]>,
  ): HttpErrorOptions {
    return {
      statusCode: statusCode,
      code: isNonEmptyString(payload?.code) ? payload.code : FALLBACK_CODE,
      message: isNonEmptyString(payload?.message) ? payload.message : FALLBACK_MESSAGE,
      details: details,
    };
  }
}
