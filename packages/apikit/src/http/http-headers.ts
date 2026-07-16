import type { IncomingHttpHeaders } from 'http';

export const HttpHeaders = {
  accept: 'accept',
  acceptLanguage: 'accept-language',
  authorization: 'authorization',
  cacheControl: 'cache-control',
  contentType: 'content-type',
  cookie: 'cookie',
  setCookie: 'set-cookie',
  userAgent: 'user-agent',
} as const;

export interface HttpHeaders extends IncomingHttpHeaders {}

export type HttpHeaderValues = {
  [K in keyof HttpHeaders as string extends K ? never : number extends K ? never : K]: HttpHeaders[K];
};

export type HttpHeaderKey = Extract<keyof HttpHeaderValues, string>;
