import { type AsyncOperation, ConversionError } from '@buildplease/core';
import { injectable, unmanaged } from 'inversify';

import type { HttpClient } from './http-client';
import type { HttpRequestOptions } from './http-request-options';
import type { RemoteEndpoint } from './remote-endpoint';

@injectable()
export abstract class RemoteResource<Input, Output> implements AsyncOperation<Input, Output, HttpRequestOptions> {
  protected constructor(
    @unmanaged()
    protected readonly endpoint: RemoteEndpoint<Input, unknown, Output, unknown>,
    @unmanaged()
    protected readonly httpClient: HttpClient,
  ) {}

  public async execute(input: Input, options?: HttpRequestOptions): Promise<Output> {
    const requestInput = await this.convertOrThrow(() => this.endpoint.convertInput(input));

    const request = this.endpoint.makeRequest(requestInput);
    const response = await this.httpClient.execute(request, options);

    const requestOutput = await this.convertOrThrow(() => this.endpoint.convertOutput(response));

    return requestOutput;
  }

  private async convertOrThrow<T>(convert: () => Promise<T>): Promise<T> {
    try {
      return await convert();
    } catch (error) {
      throw new ConversionError({ cause: error });
    }
  }
}
