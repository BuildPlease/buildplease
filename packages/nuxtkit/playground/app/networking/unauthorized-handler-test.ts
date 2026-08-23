import { type HttpError, type UnauthorizedHandler, delay } from '@buildplease/webkit';

export class HttpRequestTestUnauthorizedHandler implements UnauthorizedHandler {
  public handle(_error: HttpError): Promise<void> {
    return Promise.resolve();
  }
}

export class DelayedHttpRequestTestUnauthorizedHandler implements UnauthorizedHandler {
  public constructor(private readonly delayMs: number) {}

  public async handle(_error: HttpError): Promise<void> {
    await delay(this.delayMs);
  }
}
