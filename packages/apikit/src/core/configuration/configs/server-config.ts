export interface ServerConfig {
  /**
   * Unique identifier for the server configuration.
   * This must be unique across all server configurations.
   */
  identifier: string;

  /**
   * Trust proxy configuration
   * @see https://www.fastify.io/docs/latest/Reference/Server/#trustproxy
   * @default false
   */
  trustProxy?: boolean | string | number | string[] | ((address: string, hop: number) => boolean);
}
