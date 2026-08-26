import { type HttpClientOptions, type HttpRequestOptions, HttpClient } from '@buildplease/webkit';

export class PlaygroundHttpClient extends HttpClient {
  public constructor(options: HttpClientOptions = {}) {
    super(options);
  }

  protected createClient(_options: HttpRequestOptions): unknown {
    return undefined;
  }
}
