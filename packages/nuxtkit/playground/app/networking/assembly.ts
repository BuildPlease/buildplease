import type { Assembly, AssemblyContainer } from '@buildplease/core';

import type { NuxtApp } from '#app';
import { PlaygroundHttpClient } from '~/networking/http-client';
import {
  type HttpRequestTestOperation,
  DelayedHttpRequestTestResource,
  HttpRequestTestEndpoint,
  HttpRequestTestResource,
} from '~/networking/operation/http-request-test';
import {
  type UnauthorizedOperation,
  UnauthorizedEndpoint,
  UnauthorizedResource,
} from '~/networking/operation/unauthorized';
import { PlaygroundUnauthorizedInterceptor } from '~/networking/unauthorized-interceptor';
import {
  DelayedHttpRequestTestUnauthorizedInterceptor,
  HttpRequestTestUnauthorizedInterceptor,
} from '~/networking/unauthorized-interceptor-test';
import { Symbols } from '~/symbols';

const DELAYED_UNAUTHORIZED_INTERCEPTOR_MS = 1600;

export class NetworkingAssembly implements Assembly {
  public constructor(private readonly app: NuxtApp) {}

  public assemble(container: AssemblyContainer): void {
    container.bind<PlaygroundHttpClient>(Symbols.DI.Playground.Networking.HttpClient).toConstantValue(
      new PlaygroundHttpClient({
        errorInterceptor: new PlaygroundUnauthorizedInterceptor(this.app),
      }),
    );

    container.bind<PlaygroundHttpClient>(Symbols.DI.Playground.Networking.HttpRequestTestClient).toConstantValue(
      new PlaygroundHttpClient({
        errorInterceptor: new HttpRequestTestUnauthorizedInterceptor(),
      }),
    );

    container.bind<PlaygroundHttpClient>(Symbols.DI.Playground.Networking.DelayedHttpRequestTestClient).toConstantValue(
      new PlaygroundHttpClient({
        errorInterceptor: new DelayedHttpRequestTestUnauthorizedInterceptor(DELAYED_UNAUTHORIZED_INTERCEPTOR_MS),
      }),
    );

    container.bind(HttpRequestTestEndpoint).toSelf();
    container
      .bind<HttpRequestTestOperation>(Symbols.DI.Playground.Operation.HttpRequestTest)
      .to(HttpRequestTestResource);
    container
      .bind<HttpRequestTestOperation>(Symbols.DI.Playground.Operation.DelayedHttpRequestTest)
      .to(DelayedHttpRequestTestResource);

    container.bind(UnauthorizedEndpoint).toSelf();
    container.bind<UnauthorizedOperation>(Symbols.DI.Playground.Operation.Unauthorized).to(UnauthorizedResource);
  }
}
