import { type RemoteEndpoint, type RemoteRequestConfig } from '@meawkit/webkit';
import { decorate, injectable } from 'inversify';

import { useOperationQueue } from '#nuxtkit/composables';
import { NuxtKitRemoteResource } from '#nuxtkit/networking';

export class PublicRemoteResource<TInput, TOutput> extends NuxtKitRemoteResource<TInput, TOutput> {
  constructor(endpoint: RemoteEndpoint<TInput, any, TOutput, any>) {
    super(endpoint);
  }

  override async execute(input: TInput, options?: RemoteRequestConfig): Promise<TOutput> {
    const queue = useOperationQueue();
    return queue.enqueue(() => super.execute(input, options));
  }
}

decorate(injectable(), PublicRemoteResource);
