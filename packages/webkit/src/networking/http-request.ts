import type { HttpRequestOptions } from './http-request-options';

export interface HttpRequest<Output> {
  /**
   * Executes the request using the client created by the configured HTTP client.
   */
  readonly execute: (client: unknown) => Promise<Output>;

  /**
   * Options applied specifically to this request.
   *
   * @default undefined
   */
  readonly options?: HttpRequestOptions;
}

/**
 * Creates a transport-typed HTTP request while keeping the transport type internal
 * to the request implementation.
 */
export function defineHttpRequest<Client, Output>(
  execute: (client: Client) => Promise<Output>,
  options?: HttpRequestOptions,
): HttpRequest<Output> {
  return {
    execute: (client: unknown) => execute(client as Client),
    options: options,
  };
}
