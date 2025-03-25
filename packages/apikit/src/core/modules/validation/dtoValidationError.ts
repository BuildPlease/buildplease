export class DtoValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DtoValidationError';
  }
}
