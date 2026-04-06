import { decorate, injectable } from 'inversify';
import { sendRedirect } from 'h3';
import { type RemoteEndpoint, type RemoteRequestConfig, HttpError } from '@meawkit/webkit';

import { navigateTo, abortNavigation, isSSR } from '#imports';
import { type NuxtApp, useNuxtApp, useRouter } from '#app';

import { useNuxtKit } from '#nuxtkit-internal/composables';
import { useOperationQueue } from '#nuxtkit/composables';
import { NuxtKitRemoteResource } from '#nuxtkit/networking';

export class SecuredRemoteResource<Input, Output> extends NuxtKitRemoteResource<Input, Output> {
  private readonly kit = useNuxtKit();

  constructor(endpoint: RemoteEndpoint<Input, any, Output, any>) {
    super(endpoint);
  }

  override async execute(input: Input, options?: RemoteRequestConfig): Promise<Output> {
    const queue = useOperationQueue();

    return queue.run(() => super.execute(input, options), {
      isUnauthorized: (error) => {
        return this.isUnauthorizedError(error);
      },
      onUnauthorized: async (error) => {
        if (this.unauthorizedMode() === 'silent') return;

        const app = useNuxtApp();
        const unauthorizedHttpError = this.makeUnauthorizedHttpError(app, error);

        await app.callHook('meowv:unauthorized', {
          error: unauthorizedHttpError,
          isSSR: this.kit.isSSR,
          redirect: this.makeRedirect(app),
        });
      },
    });
  }

  protected unauthorizedMode(): 'notify' | 'silent' {
    return 'notify';
  }

  // MARK: - Private

  private isUnauthorizedError(error: unknown): HttpError | false {
    if (!(error instanceof HttpError)) return false;
    return this.kit.config.unauthorizedStatusCodes.includes(error.statusCode) ? error : false;
  }

  private makeUnauthorizedHttpError(app: NuxtApp, error: HttpError): HttpError {
    const errors = this.kit.config.errors;
    const { t, te } = app.$i18n;

    const key = errors.unauthorizedKey;
    const fallback = errors.unauthorizedMessageFallback;
    const message = te(key) ? t(key) : fallback;

    return new HttpError({
      statusCode: error.statusCode,
      code: error.code,
      message: message,
      details: error.details,
    });
  }

  private makeRedirect(app: NuxtApp) {
    return async (to: string, options?: { replace?: boolean }) => {
      const shouldReplace = options?.replace ?? true;

      if (isSSR) {
        const event = app.ssrContext?.event;
        if (!event) throw new Error('Missing SSR event');
        await sendRedirect(event, to, 302);
        abortNavigation();
        return;
      }

      if (shouldReplace) {
        await useRouter().replace(to);
        return;
      }

      await navigateTo(to);
    };
  }
}

decorate(injectable(), SecuredRemoteResource);
