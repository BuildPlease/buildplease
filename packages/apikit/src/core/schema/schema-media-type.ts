import type { SchemaExample } from '#/schema';

export type MediaType =
  | 'application/json'
  | 'application/xml'
  | 'application/x-www-form-urlencoded'
  | 'multipart/form-data'
  | 'text/plain; charset=utf-8'
  | 'text/html'
  | 'application/pdf'
  | 'image/png'
  | 'application/vnd.mycompany.myapp.v2+json'
  | 'application/vnd.ms-excel'
  | 'application/vnd.openstreetmap.data+xml'
  | 'application/vnd.github-issue.text+json'
  | 'application/vnd.github.v3.diff'
  | 'image/vnd.djvu';

export interface SchemaMediaType {
  schema: any;
  examples?: Record<string, SchemaExample>;
}
