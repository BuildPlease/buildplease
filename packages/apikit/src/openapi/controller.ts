import { injectable } from 'inversify';

import type {
  OpenAPIMediaType,
  OpenAPISchemaExample,
  OpenAPISchemaHeaders,
  OpenAPISchemaMediaType,
  OpenAPISchemaResponse,
} from '@/openapi';

export interface OpenAPISchemaController {
  makeResponse(
    description: string,
    contents: Partial<Record<OpenAPIMediaType, OpenAPISchemaMediaType>>,
    headers?: OpenAPISchemaHeaders,
  ): OpenAPISchemaResponse;
}

@injectable()
export class OpenAPISchemaControllerImpl implements OpenAPISchemaController {
  makeResponse(
    description: string,
    contents: Partial<Record<OpenAPIMediaType, OpenAPISchemaMediaType>>,
    headers?: OpenAPISchemaHeaders,
  ): OpenAPISchemaResponse {
    const response: OpenAPISchemaResponse = {
      description: description,
      content: this.constructContent(contents),
      headers: headers ? this.constructHeaders(headers) : undefined,
    };

    return response;
  }

  private constructContent(
    contents: Partial<Record<OpenAPIMediaType, OpenAPISchemaMediaType>>,
  ): Record<OpenAPIMediaType, { schema: any; examples?: Record<string, any> }> {
    return Object.entries(contents).reduce<
      Record<OpenAPIMediaType, { schema: any; examples?: Record<string, any> }>
    >(
      (acc, [type, { schema, examples }]) => {
        acc[type as OpenAPIMediaType] = {
          schema,
          examples: examples ? this.constructExamples(examples) : undefined,
        };
        return acc;
      },
      {} as Record<OpenAPIMediaType, { schema: any; examples?: Record<string, any> }>,
    );
  }

  private constructExamples(examples: Record<string, OpenAPISchemaExample>): Record<string, any> {
    return Object.entries(examples).reduce<Record<string, any>>((acc, [key, example]) => {
      acc[key] = { summary: example.summary, value: example.value };
      return acc;
    }, {});
  }

  private constructHeaders(headers: OpenAPISchemaHeaders): OpenAPISchemaHeaders {
    return headers || {};
  }
}
