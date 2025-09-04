export class CanceledError extends Error {
  public readonly code = 'CANCELED';

  constructor(opts: { message?: string; cause?: unknown } = {}) {
    const { message = 'Request canceled', cause } = opts;
    super(message);
    this.name = 'CanceledError';
    if (cause !== undefined) this.cause = cause;
  }

  public static override [Symbol.hasInstance](v: unknown): boolean {
    return v instanceof Error && (v as any).name === CanceledError.name;
  }
}
