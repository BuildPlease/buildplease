import type { HttpHeaders } from '#/http';

export interface HttpMetadata {
  reqId: string;
  method: string;
  url: string;
  protocol: string;
  query: any;
  params: any;
  ip: string;
  headers: HttpHeaders;
}
