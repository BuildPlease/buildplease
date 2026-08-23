import { injectable } from 'inversify';

import type { HttpClient } from './http-client';
import type { RemoteEndpoint } from './remote-endpoint';
import { RemoteResource } from './remote-resource';

@injectable()
export class PublicRemoteResource<Input, Output, Client> extends RemoteResource<Input, Output, Client> {
  public constructor(
    endpoint: RemoteEndpoint<Input, unknown, Output, unknown, Client>,
    httpClient: HttpClient<Client>,
  ) {
    super(endpoint, httpClient);
  }
}
