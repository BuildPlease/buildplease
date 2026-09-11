import type { HttpError, HttpErrorInterceptor, HttpErrorResolution } from '@buildplease/webkit';

import type { NuxtApp } from '#app';
import { Routes } from '~/symbols';

export class PlaygroundUnauthorizedInterceptor implements HttpErrorInterceptor {
  public constructor(private readonly app: NuxtApp) {}

  public resolve(error: HttpError): HttpErrorResolution | undefined {
    return error.statusCode === 401 ? 'interrupt' : undefined;
  }

  public async handle(error: HttpError): Promise<void> {
    await this.app.runWithContext(async () => {
      const localePath = useLocalePath();
      const notifyError = useErrorNotifier();
      const localizedPath = localePath(Routes.Login.path);

      if (import.meta.client) notifyError(error);
      await navigateTo(localizedPath, { replace: true });
    });
  }
}
