import type { HttpError } from '@nidavellirx/meowv-webkit';

export interface NuxtKitPublicRuntimeConfig {
  unauthorizedStatusCodes: NuxtKitOptions['unauthorizedStatusCodes'];
}

export interface NuxtKitOptions {
  unauthorizedStatusCodes: number[];
}

export type UnauthorizedHookContext = {
  error: HttpError;
  isSSR: boolean;
  redirect: (to: string) => Promise<void>;
};
