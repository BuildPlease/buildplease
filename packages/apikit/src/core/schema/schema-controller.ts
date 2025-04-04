import { injectable } from 'inversify';

import type {
  MediaType,
  SchemaMediaType,
  SchemaResponse,
  SchemaExample,
  SchemaHeaders,
} from '#/schema';

export interface SchemaController {
  makeResponse(
    description: string,
    contents: Partial<Record<MediaType, SchemaMediaType>>,
    headers?: SchemaHeaders,
  ): SchemaResponse;
}

@injectable()
export class SchemaControllerImpl implements SchemaController {
  makeResponse(
    description: string,
    contents: Partial<Record<MediaType, SchemaMediaType>>,
    headers?: SchemaHeaders,
  ): SchemaResponse {
    const response: SchemaResponse = {
      description: description,
      content: this.constructContent(contents),
      headers: headers ? this.constructHeaders(headers) : undefined,
    };

    return response;
  }

  private constructContent(
    contents: Partial<Record<MediaType, SchemaMediaType>>,
  ): Record<MediaType, { schema: any; examples?: Record<string, any> }> {
    return Object.entries(contents).reduce<
      Record<MediaType, { schema: any; examples?: Record<string, any> }>
    >(
      (acc, [type, { schema, examples }]) => {
        acc[type as MediaType] = {
          schema,
          examples: examples ? this.constructExamples(examples) : undefined,
        };
        return acc;
      },
      {} as Record<MediaType, { schema: any; examples?: Record<string, any> }>,
    );
  }

  private constructExamples(
    examples: Record<string, SchemaExample>,
  ): Record<string, any> {
    return Object.entries(examples).reduce<Record<string, any>>(
      (acc, [key, example]) => {
        acc[key] = { summary: example.summary, value: example.value };
        return acc;
      },
      {},
    );
  }

  private constructHeaders(headers: SchemaHeaders): SchemaHeaders {
    return headers || {};
  }
}
