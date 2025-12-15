import { decorate, injectable } from 'inversify';
import { sendRedirect } from 'h3';
import {
  type RemoteEndpoint,
  type RemoteRequestConfig,
  BaseRemoteResource,
  HttpError,
} from '@nidavellirx/meowv-webkit';

import { navigateTo, abortNavigation } from '#imports';
import { type NuxtApp, useNuxtApp, useRouter } from '#app';

import { useNuxtKit } from '#nuxtkit/composables/use-nuxt-kit';
import { useOperationQueue } from '#nuxtkit/composables/use-operation-queue';

export class SecuredRemoteResource<Input, Output> extends BaseRemoteResource<
  Input,
  Output,
  RemoteEndpoint<Input, any, Output, any>
> {
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

        await app.callHook('meowv:unauthorized', {
          error: error,
          isSSR: import.meta.server,
          redirect: this.makeRedirect(app),
        });
      },
    });
  }

  protected unauthorizedMode(): 'notify' | 'silent' {
    return 'notify';
  }

  // MARK: - Private

  private isUnauthorizedError(error: unknown): boolean {
    if (!(error instanceof HttpError)) return false;
    return this.kit.config.unauthorizedStatusCodes.includes(error.statusCode);
  }

  private makeRedirect(app: NuxtApp) {
    return async (to: string, options?: { replace?: boolean }) => {
      const shouldReplace = options?.replace ?? true;

      if (import.meta.server) {
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
