import { type HttpClientOptions, type HttpRequestOptions, HttpClient } from '@buildplease/webkit';

export class PlaygroundHttpClient extends HttpClient<void> {
  public constructor(options: HttpClientOptions = {}) {
    super(options);
  }

  protected createClient(_options: HttpRequestOptions): void {
    return undefined;
  }
}
