import { injectable, decorate } from 'inversify';
import { sendRedirect } from 'h3';

import {
  type RemoteEndpoint,
  type RequestConfig,
  RemoteResource,
  HttpError,
  UnauthorizedHttpError,
} from '@nidavellirx/meowv-webkit';

import { type NuxtApp, useNuxtApp, useRouter } from '#app';
import { navigateTo, abortNavigation, isSSR as isSSRRuntime } from '#imports';

import { SSRRequestCookiesInterceptor } from '#nuxtkit/networking/ssr-cookies-interceptor';
import { LanguageInterceptor } from '#nuxtkit/networking/language-interceptor';
import { useNuxtKit } from '#nuxtkit/composables/use-nuxt-kit';
import type { UnauthorizedRedirectOptions } from '#nuxtkit/types';

export class SecuredRemoteResource<Input, Output> extends RemoteResource<
  Input,
  Output,
  RemoteEndpoint<Input, any, Output, any>
> {
  protected readonly name = 'SecuredRemoteResource';
  private _kit: ReturnType<typeof useNuxtKit> | null = null;

  constructor(endpoint: RemoteEndpoint<Input, any, Output, any>) {
    super(endpoint);
  }

  // MARK: - Public

  override async execute(input: Input, options?: RequestConfig): Promise<Output> {
    const app = useNuxtApp();

    this.use(new LanguageInterceptor());
    this.use(new SSRRequestCookiesInterceptor(app));

    try {
      this.kit.logger.debug(`[${this.name}] -> Input: ${input}`);
      const output = await super.execute(input, options);
      this.kit.logger.debug(`[${this.name}] -> Output: ${output}`);
      return output;
    } catch (error) {
      this.kit.logger.error(`${this.name} -> Error: ${error}`);

      if (this.isUnauthorizedError(error)) {
        await this.emitUnauthorized(app, error);
        throw error;
      }

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

  private get kit() {
    return (this._kit ??= useNuxtKit());
  }

  private isHttpError(error: unknown): error is HttpError {
    return error instanceof HttpError;
  }

  private isUnauthorizedError(error: unknown): error is UnauthorizedHttpError {
    return error instanceof UnauthorizedHttpError;
  }

  private isUnauthorized(error: HttpError | UnauthorizedHttpError): boolean {
    const codes = this.kit.config.unauthorizedStatusCodes;
    return codes.includes(error.statusCode);
  }

  private async emitUnauthorized(app: NuxtApp, error: HttpError | UnauthorizedHttpError): Promise<void> {
    const isSSR = isSSRRuntime();
    const defaultRedirectOptions: Required<UnauthorizedRedirectOptions> = {
      replace: false,
    };

    const redirect = (to: string, options?: UnauthorizedRedirectOptions) =>
      this.redirect(app, to, isSSR, { ...defaultRedirectOptions, ...options });

    await app.callHook('meowv:unauthorized', { error, isSSR, redirect });
  }

  private async redirect(
    app: NuxtApp,
    to: string,
    isSSR: boolean,
    opts: Required<UnauthorizedRedirectOptions>,
  ): Promise<void> {
    if (isSSR) {
      const event = app.ssrContext?.event;
      if (!event) throw new Error('SSR redirect requested without request event.');
      await sendRedirect(event, to, 302);
      abortNavigation();
      return;
    }

    if (opts.replace) {
      const router = useRouter();
      await router.replace(to);
    } else {
      await navigateTo(to);
    }
  }
}

decorate(injectable(), SecuredRemoteResource);
