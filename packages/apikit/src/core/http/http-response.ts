import type { HttpHeaders } from '#/http';

export enum ResponseType {
  JSON = 'JSON',
  File = 'File',
}

export abstract class HttpResponse {
  readonly statusCode: number;
  readonly headers?: HttpHeaders;
  abstract readonly responseType: ResponseType;

  constructor({ statusCode, headers }: { statusCode: number; headers?: HttpHeaders }) {
    this.statusCode = statusCode;
    this.headers = headers;
  }
}

export class JSONHttpResponse extends HttpResponse {
  readonly data: any;
  readonly responseType = ResponseType.JSON;

  constructor({
    statusCode,
    data,
    headers,
  }: {
    statusCode: number;
    data: any;
    headers?: HttpHeaders;
  }) {
    super({ statusCode, headers });
    this.data = data;
  }
}

export class FileHttpResponse extends HttpResponse {
  readonly filePath: string;
  readonly shouldRender: boolean;
  readonly data?: any;
  readonly responseType = ResponseType.File;

  constructor({
    statusCode,
    filePath,
    shouldRender,
    headers,
    data,
  }: {
    statusCode: number;
    filePath: string;
    shouldRender: boolean;
    headers?: HttpHeaders;
    data?: any;
  }) {
    super({ statusCode, headers });
    this.filePath = filePath;
    this.shouldRender = shouldRender;
    this.data = data;
  }
}
