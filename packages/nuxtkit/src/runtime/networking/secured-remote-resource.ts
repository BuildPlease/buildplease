import { injectable, decorate } from 'inversify';
import { sendRedirect } from 'h3';

import {
  type RemoteEndpoint,
  type RequestConfig,
  RemoteResource,
  HttpError,
  UnauthorizedHttpError,
} from '@nidavellirx/meowv-webkit';

import { SSRRequestCookiesInterceptor } from './ssr-cookies-interceptor';
import { LanguageInterceptor } from './language-interceptor';

import { useRuntimeConfig, navigateTo, abortNavigation, isSSR as isSSRRuntime } from '#imports';
import { type NuxtApp, useNuxtApp } from '#app';

export class SecuredRemoteResource<Input, Output> extends RemoteResource<
  Input,
  Output,
  RemoteEndpoint<Input, any, Output, any>
> {
  constructor(endpoint: RemoteEndpoint<Input, any, Output, any>) {
    super(endpoint);
  }

  override async execute(input: Input, options?: RequestConfig): Promise<Output> {
    const app = useNuxtApp();

    this.use(new SSRRequestCookiesInterceptor(app));
    this.use(new LanguageInterceptor());

    try {
      return await super.execute(input, options);
    } catch (error) {
      if (this.isUnauthorized(error)) {
        await this.emitUnauthorized(app, error);

        throw new UnauthorizedHttpError({
          statusCode: error.statusCode,
          code: error.code,
          message: error.message,
          details: error.details,
        });
      }

      throw error;
    }
  }

  // MARK: - Unauthorized

  private isUnauthorized(error: unknown): error is HttpError {
    if (!(error instanceof HttpError)) return false;

    const config = useRuntimeConfig();
    const codes = config.public.meowvNuxtKit.unauthorizedStatusCodes;

    return codes.includes(error.statusCode);
  }

  private async emitUnauthorized(app: NuxtApp, error: HttpError): Promise<void> {
    const isSSR = isSSRRuntime();

    const redirect = async (to: string) => {
      if (isSSR) {
        const event = app.ssrContext?.event;
        if (!event) throw new Error('SSR redirect requested without request event.');
        await sendRedirect(event, to);
        abortNavigation();
      } else {
        await navigateTo(to);
      }
    };

    await app.callHook('meowv:unauthorized', { error: error, isSSR: isSSR, redirect: redirect });
  }
}

decorate(injectable(), SecuredRemoteResource);
