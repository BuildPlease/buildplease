import { type AsyncOperation, type RemoteEndpoint, type RemoteRequestConfig, delay, HttpError } from '@meawkit/webkit';
import { inject, injectable } from 'inversify';

export type UnauthorizedOperation = AsyncOperation<void, void>;

@injectable()
export class UnauthorizedEndpoint implements RemoteEndpoint<void, void, void, void> {
  async makeRequest(_input: void, _options?: RemoteRequestConfig): Promise<void> {
    await delay(2000);

    throw new HttpError({
      code: 'unauthorized_error',
      statusCode: 401,
      message: 'Unauthorized message from server',
    });
  }

  async convertInput(input: void): Promise<void> {
    return input;
  }

  async convertOutput(response: void): Promise<void> {
    return response;
  }
}

@injectable()
export class UnauthorizedResource extends SecuredRemoteResource<void, void> {
  constructor(@inject(UnauthorizedEndpoint) endpoint: UnauthorizedEndpoint) {
    super(endpoint);
  }
}
