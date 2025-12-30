import type { IncomingHttpHeaders } from 'http';

export interface HttpHeaders extends IncomingHttpHeaders {}

export type HttpHeaderValues = {
  [K in keyof HttpHeaders as string extends K ? never : number extends K ? never : K]: HttpHeaders[K];
};

export type HttpHeaderKey = Extract<keyof HttpHeaderValues, string>;
