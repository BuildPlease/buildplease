import type { HttpHeaders } from '@/http';

export interface RequestMetadata {
  requestId: string;
  method: string;
  url: string;
  protocol: string;
  query: any;
  params: any;
  ip: string;
  headers: HttpHeaders;
  locale: string;
}
