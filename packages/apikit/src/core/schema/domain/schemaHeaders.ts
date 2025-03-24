export interface SchemaHeader {
  description?: string;
  type: string;
  format?: string;
}

export type SchemaHeaders = Partial<Record<string, SchemaHeader>>;
