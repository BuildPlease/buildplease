import {
  type AsyncOperation,
  type HttpClient,
  type HttpRequest,
  type RemoteEndpoint,
  delay,
  HttpError,
  SecuredRemoteResource,
} from '@buildplease/webkit';
import { inject, injectable } from 'inversify';

import { Symbols } from '~/di/symbols';

export enum UnauthorizedErrorCode {
  Unauthorized = 'playground_unauthorized',
}

export type UnauthorizedOperation = AsyncOperation<void, void>;

@injectable()
export class UnauthorizedEndpoint implements RemoteEndpoint<void, void, void, void> {
  public async convertInput(input: void): Promise<void> {
    return input;
  }

  public makeRequest(_input: void): HttpRequest<void> {
    return {
      execute: async () => {
        await delay(2000);

        throw new HttpError({
          code: UnauthorizedErrorCode.Unauthorized,
          statusCode: 401,
          message: 'Unauthorized message from server',
        });
      },
    };
  }

  public async convertOutput(response: void): Promise<void> {
    return response;
  }
}

@injectable()
export class UnauthorizedResource extends SecuredRemoteResource<void, void> {
  public constructor(
    @inject(UnauthorizedEndpoint) endpoint: UnauthorizedEndpoint,
    @inject(Symbols.DI.Networking.HttpClient) httpClient: HttpClient,
  ) {
    super(endpoint, httpClient);
  }
}
