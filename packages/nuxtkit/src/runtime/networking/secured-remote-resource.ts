import { type RemoteEndpoint, type RemoteRequestConfig, HttpError } from '@buildplease/webkit';
import { decorate, injectable } from 'inversify';

import { type NuxtApp, useNuxtApp } from '#app';
import { navigateTo } from '#imports';
import { useNuxtKit } from '#internal-runtime';
import { MODULE_HOOK_UNAUTHORIZED_NAME } from '#internal-shared';
import { useOperationQueue } from '#nuxtkit/composables';
import { resolveI18nMessage } from '#nuxtkit/i18n';
import { NuxtKitRemoteResource } from '#nuxtkit/networking';

export class SecuredRemoteResource<TInput, TOutput> extends NuxtKitRemoteResource<TInput, TOutput> {
  private readonly kit = useNuxtKit();

  constructor(endpoint: RemoteEndpoint<TInput, any, TOutput, any>) {
    super(endpoint);
  }

  override async execute(input: TInput, options?: RemoteRequestConfig): Promise<TOutput> {
    const queue = useOperationQueue();

    return queue.run(() => super.execute(input, options), {
      isUnauthorized: (error) => {
        return this.isUnauthorizedError(error);
      },
      onUnauthorized: async (error) => {
        if (this.unauthorizedMode === 'silent') return;

        const app = useNuxtApp();
        const unauthorizedHttpError = this.makeUnauthorizedHttpError(app, error);

        await app.callHook(MODULE_HOOK_UNAUTHORIZED_NAME, {
          error: unauthorizedHttpError,
          isSSR: this.kit.isSSR,
          redirect: this.makeRedirect(app),
        });
      },
    });
  }

  protected get unauthorizedMode(): 'notify' | 'silent' {
    return 'notify';
  }

  // MARK: - Private

  private isUnauthorizedError(error: unknown): HttpError | false {
    if (!(error instanceof HttpError)) return false;
    return this.kit.config.unauthorizedStatusCodes.includes(error.statusCode) ? error : false;
  }

  private makeUnauthorizedHttpError(app: NuxtApp, error: HttpError): HttpError {
    const errors = this.kit.config.errors;
    const key = errors.unauthorizedKey;
    const fallback = errors.unauthorizedMessageFallback;
    const message = resolveI18nMessage(app.$i18n, key, fallback);

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

      await app.runWithContext(async () => {
        await navigateTo(to, { replace: shouldReplace });
      });
    };
  }
}

decorate(injectable(), SecuredRemoteResource);
