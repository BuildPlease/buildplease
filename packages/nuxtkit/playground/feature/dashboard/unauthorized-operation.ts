import { injectable, inject } from 'inversify';

import {
  type AsyncOperation,
  type RequestConfig,
  type RemoteEndpoint,
  delay,
  HttpError,
} from '@nidavellirx/meowv-webkit';

export type UnauthorizedOperation = AsyncOperation<void, void>;

@injectable()
export class UnauthorizedEndpoint implements RemoteEndpoint<void, void, void, void> {
  async makeRequest(_input: void, _options?: RequestConfig): Promise<void> {
    await delay(2000);

    throw new HttpError({
      code: 'unauthorized_error',
      statusCode: 401,
      message: 'Unauthorized Message',
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
