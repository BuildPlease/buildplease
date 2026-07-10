import type { ApiKitI18nConfig, ApiKitI18nSource, DefineApiKitI18nInput } from './i18n-config';

export function defineApiKitI18n(input: DefineApiKitI18nInput): ApiKitI18nConfig {
  return {
    ...input,
    build: input.build ?? {},
    resources: input.resources ?? {},
  };
}

export function defineApiKitI18nSource<const Source extends ApiKitI18nSource>(source: Source): Source {
  return source;
}
