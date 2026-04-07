import { type RemoteEndpoint, BaseRemoteResource } from '@meawkit/webkit';
import { decorate, injectable } from 'inversify';

import { LanguageInterceptor, SSRRequestCookiesInterceptor } from '#nuxtkit/networking';

export abstract class NuxtKitRemoteResource<Input, Output> extends BaseRemoteResource<
  Input,
  Output,
  RemoteEndpoint<Input, any, Output, any>
> {
  constructor(endpoint: RemoteEndpoint<Input, any, Output, any>) {
    super(endpoint);

    this.use(new SSRRequestCookiesInterceptor(), new LanguageInterceptor());
  }
}

decorate(injectable(), NuxtKitRemoteResource);
