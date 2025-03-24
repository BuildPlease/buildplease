import { MediaType, SchemaHeaders } from './';

export interface SchemaResponse {
  description: string;
  content: Record<
    MediaType,
    {
      schema: any;
      examples?: Record<string, any>;
    }
  >;
  headers?: SchemaHeaders;
}
