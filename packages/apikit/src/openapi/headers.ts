export interface OpenAPISchemaHeader {
  description?: string;
  type: string;
  format?: string;
}

export type OpenAPISchemaHeaders = Partial<Record<string, OpenAPISchemaHeader>>;
