import { injectable } from 'inversify';

import type { HttpClient } from './http-client';
import type { RemoteEndpoint } from './remote-endpoint';
import { RemoteResource } from './remote-resource';

@injectable()
export class PublicRemoteResource<Input, Output> extends RemoteResource<Input, Output> {
  public constructor(endpoint: RemoteEndpoint<Input, unknown, Output, unknown>, httpClient: HttpClient) {
    super(endpoint, httpClient);
  }
}
