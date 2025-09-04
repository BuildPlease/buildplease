import { injectable } from 'inversify'
import { sendRedirect } from 'h3'
import { useNuxtApp } from '#app'
import { useRuntimeConfig, navigateTo, abortNavigation } from '#imports'

import {
  RemoteResource as WebKitRemoteResource,
  type RemoteEndpoint,
  HttpError,
} from '@nidavellirx/meowv-webkit'

import { SSRRequestCookiesInterceptor } from './ssr-cookies-interceptor'
import { LanguageInterceptor } from './language-interceptor'

@injectable()
export class SecuredRemoteResource<Input, Output> extends WebKitRemoteResource<
  Input,
  Output,
  RemoteEndpoint<Input, any, Output, any>
> {
  constructor(endpoint: RemoteEndpoint<Input, any, Output, any>, options?: SecuredOptions) {
    super(endpoint)

  }

  override async execute(input: Input): Promise<Output> {
    const app = useNuxtApp()

    try {
      return await super.execute(input)
    } catch (error) {
      if (this.isUnauthorized(error)) {
        await this.handleUnauthorized(app)
      }
      throw error
    }
  }

  // MARK: - Unauthorized

  private isUnauthorized(error: unknown): boolean {
    return error instanceof HttpError && this.opts.unauthorizedStatusCodes.includes(error.statusCode)
  }

  private async handleUnauthorized(app: ReturnType<typeof useNuxtApp>): Promise<void> {
    const target = this.opts.unauthorizedRedirectTo

    if (import.meta.env.SSR) {
      const event = app.ssrContext?.event
      if (!event) return
      await sendRedirect(event, target)
      abortNavigation()
    } else {
      await navigateTo(target)
    }
  }
}
