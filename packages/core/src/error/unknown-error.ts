export class UnknownError extends Error {
  public readonly code = 'UNKNOWN';

  constructor(opts: { message?: string; cause?: unknown } = {}) {
    const { message = 'Unknown error', cause } = opts;
    super(message);
    this.name = 'UnknownError';
    if (cause !== undefined) this.cause = cause;
  }

  public static override [Symbol.hasInstance](v: unknown): boolean {
    return v instanceof Error && (v as any).name === 'UnknownError';
  }
}
