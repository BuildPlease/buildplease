import type { HttpError, UnauthorizedHandler } from '@buildplease/webkit';

import type { NuxtApp } from '#app';
import { AppSymbols } from '~/symbols';

export class PlaygroundUnauthorizedHandler implements UnauthorizedHandler {
  public constructor(private readonly app: NuxtApp) {}

  public async handle(error: HttpError): Promise<void> {
    await this.app.runWithContext(async () => {
      const localePath = useLocalePath();
      const notifyError = useErrorNotifier();
      const localizedPath = localePath(AppSymbols.Routes.Login.path);

      if (import.meta.client) notifyError(error);
      await navigateTo(localizedPath, { replace: true });
    });
  }
}
