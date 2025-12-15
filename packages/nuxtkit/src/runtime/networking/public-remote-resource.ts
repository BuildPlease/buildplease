import { decorate, injectable } from 'inversify';
import { type RemoteEndpoint, type RemoteRequestConfig } from '@nidavellirx/meowv-webkit';

import { useOperationQueue } from '#nuxtkit/composables';
import { NuxtKitRemoteResource } from '#nuxtkit/networking';

export class PublicRemoteResource<Input, Output> extends NuxtKitRemoteResource<Input, Output> {
  constructor(endpoint: RemoteEndpoint<Input, any, Output, any>) {
    super(endpoint);
  }

  override async execute(input: Input, options?: RemoteRequestConfig): Promise<Output> {
    const queue = useOperationQueue();
    return queue.enqueue(() => super.execute(input, options));
  }
}

decorate(injectable(), PublicRemoteResource);
