import { type RemoteEndpoint, BaseRemoteResource } from '@meawkit/webkit';
import { decorate, injectable } from 'inversify';

import { LanguageInterceptor, SSRRequestCookiesInterceptor } from '#nuxtkit/networking';

export abstract class NuxtKitRemoteResource<TInput, TOutput> extends BaseRemoteResource<
  TInput,
  TOutput,
  RemoteEndpoint<TInput, any, TOutput, any>
> {
  constructor(endpoint: RemoteEndpoint<TInput, any, TOutput, any>) {
    super(endpoint);

    this.use(new SSRRequestCookiesInterceptor(), new LanguageInterceptor());
  }
}

decorate(injectable(), NuxtKitRemoteResource);
