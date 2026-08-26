import { ConversionError } from '@buildplease/core';
import { describe, expect, it } from 'vitest';

import {
  type HttpRequest,
  type HttpRequestOptions,
  type RemoteEndpoint,
  defineHttpRequest,
  HttpClient,
  RemoteResource,
} from '@/networking';

interface Input {
  readonly id: string;
}

interface InputDto {
  readonly id: string;
}

interface OutputDto {
  readonly value: string;
}

interface Output {
  readonly value: string;
}

type Client = (id: string) => Promise<OutputDto>;

class TestEndpoint implements RemoteEndpoint<Input, InputDto, Output, OutputDto> {
  public inputError?: unknown;
  public outputError?: unknown;

  public async convertInput(input: Input): Promise<InputDto> {
    if (this.inputError !== undefined) throw this.inputError;
    return { id: input.id };
  }

  public makeRequest(input: InputDto): HttpRequest<OutputDto> {
    return defineHttpRequest<Client, OutputDto>((client) => client(input.id));
  }

  public async convertOutput(response: OutputDto): Promise<Output> {
    if (this.outputError !== undefined) throw this.outputError;
    return { value: response.value };
  }
}

class TestHttpClient extends HttpClient {
  protected createClient(_options: HttpRequestOptions): Client {
    return async (id) => ({ value: id });
  }
}

class TestRemoteResource extends RemoteResource<Input, Output> {
  public constructor(endpoint: TestEndpoint, httpClient: HttpClient) {
    super(endpoint, httpClient);
  }
}

describe('RemoteResource', () => {
  it('executes endpoint conversion and HTTP request orchestration', async () => {
    const resource = new TestRemoteResource(new TestEndpoint(), new TestHttpClient());

    await expect(resource.execute({ id: 'account' })).resolves.toEqual({ value: 'account' });
  });

  it('converts input conversion failures to ConversionError', async () => {
    const failure = new Error('bad input');
    const endpoint = new TestEndpoint();
    endpoint.inputError = failure;
    const resource = new TestRemoteResource(endpoint, new TestHttpClient());

    const promise = resource.execute({ id: 'account' });

    await expect(promise).rejects.toBeInstanceOf(ConversionError);
    await expect(promise).rejects.toMatchObject({ cause: failure });
  });

  it('converts output conversion failures to ConversionError', async () => {
    const failure = new Error('bad output');
    const endpoint = new TestEndpoint();
    endpoint.outputError = failure;
    const resource = new TestRemoteResource(endpoint, new TestHttpClient());

    const promise = resource.execute({ id: 'account' });

    await expect(promise).rejects.toBeInstanceOf(ConversionError);
    await expect(promise).rejects.toMatchObject({ cause: failure });
  });
});
