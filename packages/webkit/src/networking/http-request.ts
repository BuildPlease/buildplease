import type { HttpRequestOptions } from './http-request-options';

export interface HttpRequest<Client, Output> {
  /**
   * Executes the request using the configured client.
   */
  readonly execute: (client: Client) => Promise<Output>;

  /**
   * Options applied specifically to this request.
   *
   * @default undefined
   */
  readonly options?: HttpRequestOptions;
}
