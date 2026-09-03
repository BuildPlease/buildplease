export class ConversionError extends Error {
  public readonly code = 'MALFORMED_DATA';
  public readonly field?: string;

  constructor(opts: { message?: string; field?: string; cause?: unknown } = {}) {
    const { message = 'Malformed data', field, cause } = opts;
    super(message);
    this.name = 'ConversionError';
    this.field = field;
    if (cause !== undefined) this.cause = cause;
  }
}
