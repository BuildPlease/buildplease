export class TimeoutError extends Error {
  public readonly code = 'TIMEOUT';

  constructor(opts: { message?: string; cause?: unknown } = {}) {
    const { message = 'Request timeout', cause } = opts;
    super(message);
    this.name = 'TimeoutError';
    if (cause !== undefined) this.cause = cause;
  }

  public static override [Symbol.hasInstance](v: unknown): boolean {
    return v instanceof Error && (v as any).name === 'TimeoutError';
  }
}
