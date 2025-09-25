import type { OpenAPIMediaType, OpenAPISchemaHeaders } from '#/openapi';

export interface OpenAPISchemaResponse {
  description: string;
  content: Record<
    OpenAPIMediaType,
    {
      schema: any;
      examples?: Record<string, any>;
    }
  >;
  headers?: OpenAPISchemaHeaders;
}
