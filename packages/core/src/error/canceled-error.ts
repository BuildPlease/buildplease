export class CanceledError extends Error {
  public readonly code = 'CANCELED';

  constructor(opts: { message?: string; cause?: unknown } = {}) {
    const { message = 'Request canceled', cause } = opts;
    super(message);
    this.name = 'CanceledError';
    if (cause !== undefined) this.cause = cause;
  }
}
