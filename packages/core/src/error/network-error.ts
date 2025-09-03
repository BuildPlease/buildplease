export class NetworkError extends Error {
  public readonly code = 'NETWORK_ERROR';

  constructor(opts: { message?: string; cause?: unknown } = {}) {
    const { message = 'Network error', cause } = opts;
    super(message);
    this.name = 'NetworkError';
    if (cause !== undefined) this.cause = cause;
  }

  public static override [Symbol.hasInstance](v: unknown): boolean {
    return v instanceof Error && (v as any).name === 'NetworkError';
  }
}
