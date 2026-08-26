import { CanceledError } from '@buildplease/core';
import { injectable } from 'inversify';

import type { HttpClient } from './http-client';
import { HttpError } from './http-error';
import type { HttpRequestOptions } from './http-request-options';
import type { RemoteEndpoint } from './remote-endpoint';
import { RemoteResource } from './remote-resource';

@injectable()
export class SecuredRemoteResource<Input, Output, Client> extends RemoteResource<Input, Output, Client> {
  public constructor(
    endpoint: RemoteEndpoint<Input, unknown, Output, unknown, Client>,
    httpClient: HttpClient<Client>,
  ) {
    super(endpoint, httpClient);
  }

  public override async execute(input: Input, options?: HttpRequestOptions): Promise<Output> {
    try {
      return await super.execute(input, options);
    } catch (error) {
      if (!(error instanceof HttpError)) throw error;

      const unauthorized = this.httpClient.unauthorized;
      if (!unauthorized || !unauthorized.statusCodes.includes(error.statusCode)) throw error;

      if (!unauthorized.cancelAll) {
        await unauthorized.handler.handle(error);
        throw error;
      }

      await this.httpClient.asyncQueue.interrupt(() => unauthorized.handler.handle(error));
      throw new CanceledError({ cause: error });
    }
  }
}
