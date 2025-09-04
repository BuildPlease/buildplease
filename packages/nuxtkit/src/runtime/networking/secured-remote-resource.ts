import { injectable } from 'inversify'
import { sendRedirect } from 'h3'
import { useNuxtApp } from '#app'
import { useRuntimeConfig, navigateTo, abortNavigation } from '#imports'

import {
  RemoteResource as WebKitRemoteResource,
  type RemoteEndpoint,
  HttpError,
} from '@nidavellirx/meowv-webkit'

import { SSRRequestCookiesInterceptor } from './ssr-cookie-interceptor'
import { LanguageInterceptor } from './language-interceptor'

interface SecuredOptions {
  /** Which HTTP status codes count as unauthorized (default: [401]) */
  unauthorizedStatusCodes?: number[]
  /** Where to redirect on unauthorized (default: '/login') */
  unauthorizedRedirectTo?: string
}

const DEFAULTS: Required<SecuredOptions> = {
  unauthorizedStatusCodes: [401],
  unauthorizedRedirectTo: '/login',
}

function readRuntimeOptions(): Partial<SecuredOptions> {
  // Optional: apps can define public.meowvNuxtkit.{unauthorizedStatusCodes, unauthorizedRedirectTo}
  // If not defined, we’ll just use defaults.
  const rc = useRuntimeConfig() as any
  const pub = rc?.public?.meowvNuxtkit ?? {}

  const opts: Partial<SecuredOptions> = {}
  if (Array.isArray(pub.unauthorizedStatusCodes)) opts.unauthorizedStatusCodes = pub.unauthorizedStatusCodes
  if (typeof pub.unauthorizedRedirectTo === 'string') opts.unauthorizedRedirectTo = pub.unauthorizedRedirectTo
  return opts
}

@injectable()
export class SecuredRemoteResource<Input, Output> extends WebKitRemoteResource<
  Input,
  Output,
  RemoteEndpoint<Input, any, Output, any>
> {
  private opts: Required<SecuredOptions>

  constructor(endpoint: RemoteEndpoint<Input, any, Output, any>, options?: SecuredOptions) {
    super(endpoint)

    // Attach Nuxt-specific interceptors (no CookieInterceptor here;
    // WebKit's RemoteResource already sets withCredentials=true).
    const nuxt = useNuxtApp()
    this.use(new SSRRequestCookiesInterceptor(nuxt))
    this.use(new LanguageInterceptor())

    // Merge defaults <- runtime config <- explicit options
    this.opts = {
      ...DEFAULTS,
      ...readRuntimeOptions(),
      ...(options ?? {}),
    }
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
