export interface ServerConfig {
  /**
   * Unique server identifier.
   * Note: must be unique across all server configurations.
   *
   * @required
   *
   * @example "main-api-test"
   * @example "main-api-production"
   */
  identifier: string;

  /**
   * Configures proxy trust behavior.
   *
   * Controls how proxy headers such as `X-Forwarded-For` are interpreted.
   *
   * @optional
   * @default false
   *
   * @see https://www.fastify.io/docs/latest/Reference/Server/#trustproxy
   */
  trustProxy: boolean | string | number | string[] | ((address: string, hop: number) => boolean);
}
