export class NetworkError extends Error {
  public readonly code = 'NETWORK_ERROR';

  constructor(opts: { message?: string; cause?: unknown } = {}) {
    const { message = 'Network error', cause } = opts;
    super(message);
    this.name = 'NetworkError';
    if (cause !== undefined) this.cause = cause;
  }
}
