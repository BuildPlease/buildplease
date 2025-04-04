export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly responseMessage?: string;

  constructor(statusCode: number, message?: string, responseMessage?: string) {
    super(message || `HTTP error with status code ${statusCode}`);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.responseMessage = responseMessage;
  }
}
