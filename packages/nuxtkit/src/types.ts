import type { NuxtApp } from 'nuxt/app';
import type { HttpError } from '@nidavellirx/meowv-webkit';

export interface NuxtKitPublicRuntimeConfig {
  unauthorizedStatusCodes: number[];
}

export type UnauthorizedHandler = (ctx: {
  nuxt: NuxtApp;
  error: HttpError;
  isSSR: boolean;
  redirect: (to: string) => Promise<void>;
}) => void | Promise<void>;

export interface NuxtKitOptions {
  unauthorizedStatusCodes: number[];
  unauthorizedHandler?: UnauthorizedHandler;
}
