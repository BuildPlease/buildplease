import { IncomingHttpHeaders } from 'http';

export interface HttpHeaders extends IncomingHttpHeaders {}

export type HttpHeadersKeys = {
  [K in keyof HttpHeaders as string extends K
    ? never
    : number extends K
      ? never
      : K]: HttpHeaders[K];
};
