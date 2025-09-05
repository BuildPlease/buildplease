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

  // MARK: - Public

  override async execute(input: Input, options?: RequestConfig): Promise<Output> {
    const app = useNuxtApp();

    this.use(new SSRRequestCookiesInterceptor(app));
    this.use(new LanguageInterceptor());

    try {
      return await super.execute(input, options);
    } catch (error) {
      if (!this.isHttpError(error)) {
        throw error;
      }

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

  // MARK: - Private

  private isHttpError(error: unknown): error is HttpError {
    return error instanceof HttpError;
  }

  private isUnauthorized(error: HttpError): boolean {
    if (error instanceof UnauthorizedHttpError) return true;
    const codes = useRuntimeConfig().public.meowvNuxtKit.unauthorizedStatusCodes;
    return codes.includes(error.statusCode);
  }

  private async emitUnauthorized(app: NuxtApp, error: HttpError): Promise<void> {
    const isSSR = isSSRRuntime();
    const redirect = (to: string) => this.redirect(app, to, isSSR);
    await app.callHook('meowv:unauthorized', { error, isSSR, redirect });
  }

  private async redirect(app: NuxtApp, to: string, isSSR: boolean): Promise<void> {
    if (isSSR) {
      const event = app.ssrContext?.event;
      if (!event) throw new Error('SSR redirect requested without request event.');
      await sendRedirect(event, to);
      abortNavigation();
      return;
    }
    await navigateTo(to);
  }
}

decorate(injectable(), SecuredRemoteResource);
