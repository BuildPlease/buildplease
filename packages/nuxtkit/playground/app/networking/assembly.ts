import type { Assembly, AssemblyContainer } from '@buildplease/webkit';

import type { NuxtApp } from '#app';
import { Symbols } from '~/di/symbols';
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
import { PlaygroundUnauthorizedHandler } from '~/networking/unauthorized-handler';
import {
  DelayedHttpRequestTestUnauthorizedHandler,
  HttpRequestTestUnauthorizedHandler,
} from '~/networking/unauthorized-handler-test';

const UNAUTHORIZED_STATUS_CODES = [401] as const;
const DELAYED_UNAUTHORIZED_HANDLER_MS = 1600;

export class NetworkingAssembly implements Assembly {
  public constructor(private readonly app: NuxtApp) {}

  public assemble(container: AssemblyContainer): void {
    container.bind<PlaygroundHttpClient>(Symbols.DI.Networking.HttpClient).toConstantValue(
      new PlaygroundHttpClient({
        unauthorized: {
          statusCodes: UNAUTHORIZED_STATUS_CODES,
          cancelAll: true,
          handler: new PlaygroundUnauthorizedHandler(this.app),
        },
      }),
    );

    container.bind<PlaygroundHttpClient>(Symbols.DI.Networking.HttpRequestTestClient).toConstantValue(
      new PlaygroundHttpClient({
        unauthorized: {
          statusCodes: UNAUTHORIZED_STATUS_CODES,
          cancelAll: true,
          handler: new HttpRequestTestUnauthorizedHandler(),
        },
      }),
    );

    container.bind<PlaygroundHttpClient>(Symbols.DI.Networking.DelayedHttpRequestTestClient).toConstantValue(
      new PlaygroundHttpClient({
        unauthorized: {
          statusCodes: UNAUTHORIZED_STATUS_CODES,
          cancelAll: true,
          handler: new DelayedHttpRequestTestUnauthorizedHandler(DELAYED_UNAUTHORIZED_HANDLER_MS),
        },
      }),
    );

    container.bind(HttpRequestTestEndpoint).toSelf();
    container.bind<HttpRequestTestOperation>(Symbols.DI.Operation.HttpRequestTest).to(HttpRequestTestResource);
    container
      .bind<HttpRequestTestOperation>(Symbols.DI.Operation.DelayedHttpRequestTest)
      .to(DelayedHttpRequestTestResource);

    container.bind(UnauthorizedEndpoint).toSelf();
    container.bind<UnauthorizedOperation>(Symbols.DI.Operation.Unauthorized).to(UnauthorizedResource);
  }
}
