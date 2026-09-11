import { delay } from '@buildplease/core';
import type { HttpError, HttpErrorInterceptor, HttpErrorResolution } from '@buildplease/webkit';

export class HttpRequestTestUnauthorizedInterceptor implements HttpErrorInterceptor {
  public resolve(error: HttpError): HttpErrorResolution | undefined {
    return error.statusCode === 401 ? 'interrupt' : undefined;
  }

  public handle(_error: HttpError): Promise<void> {
    return Promise.resolve();
  }
}

export class DelayedHttpRequestTestUnauthorizedInterceptor implements HttpErrorInterceptor {
  public constructor(private readonly delayMs: number) {}

  public resolve(error: HttpError): HttpErrorResolution | undefined {
    return error.statusCode === 401 ? 'interrupt' : undefined;
  }

  public async handle(_error: HttpError): Promise<void> {
    await delay(this.delayMs);
  }
}
