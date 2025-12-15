import { decorate, injectable } from 'inversify';

import { type RemoteEndpoint, type RemoteRequestConfig, BaseRemoteResource } from '@nidavellirx/meowv-webkit';

import { useOperationQueue } from '#nuxtkit/composables/use-operation-queue';

export class PublicRemoteResource<Input, Output> extends BaseRemoteResource<
  Input,
  Output,
  RemoteEndpoint<Input, any, Output, any>
> {
  constructor(endpoint: RemoteEndpoint<Input, any, Output, any>) {
    super(endpoint);
  }

  override async execute(input: Input, options?: RemoteRequestConfig): Promise<Output> {
    const queue = useOperationQueue();
    return queue.enqueue(() => super.execute(input, options));
  }
}

decorate(injectable(), PublicRemoteResource);
