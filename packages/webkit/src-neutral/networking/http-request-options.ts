export interface HttpRequestOptions {
  /**
   * Whether browser credentials such as cookies should be included with the request,
   * including cross-origin requests.
   *
   * @default true
   */
  readonly credentials?: boolean;

  /**
   * Headers included with the request.
   *
   * @default {}
   */
  readonly headers?: Readonly<Record<string, string>>;
}
