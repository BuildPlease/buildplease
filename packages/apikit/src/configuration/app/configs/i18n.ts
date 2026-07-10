import { ApiKitAppDefaults } from '@internal/configuration/app';
import type { InitOptions } from 'i18next';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export interface I18nDirectoryEntry {
  readonly path: string;
  readonly namespace?: string;
}

export interface I18nFileEntry {
  readonly locale: string;
  readonly path: string;
  readonly namespace?: string;
}

type I18nInitOptions = InitOptions<object>;

export type I18nFallbackLanguages = Extract<NonNullable<I18nInitOptions['fallbackLng']>, string | readonly string[]>;

export type I18nLoadMode = NonNullable<I18nInitOptions['load']>;
export type I18nPreload = NonNullable<I18nInitOptions['preload']>;

export const I18nConfiguration = defineConfiguration('apikit.i18n', {
  directories: field.array(field.custom<I18nDirectoryEntry>()).default(ApiKitAppDefaults.i18n.directories),
  files: field.array(field.custom<I18nFileEntry>()).default(ApiKitAppDefaults.i18n.files),

  defaultLanguage: field.string().default(ApiKitAppDefaults.i18n.defaultLanguage),
  fallbackLanguages: field.custom<I18nFallbackLanguages>().default(ApiKitAppDefaults.i18n.fallbackLanguages),
  supportedLanguages: field.array(field.string()).default(ApiKitAppDefaults.i18n.supportedLanguages),

  load: field.custom<I18nLoadMode>().default(ApiKitAppDefaults.i18n.load),
  preload: field.custom<I18nPreload>().default(ApiKitAppDefaults.i18n.preload),
  nonExplicitSupportedLngs: field.boolean().default(ApiKitAppDefaults.i18n.nonExplicitSupportedLngs),
  lowerCaseLng: field.boolean().default(ApiKitAppDefaults.i18n.lowerCaseLng),
  cleanCode: field.boolean().default(ApiKitAppDefaults.i18n.cleanCode),

  namespaces: field.array(field.string()).optional(),
  defaultNamespace: field.string().default(ApiKitAppDefaults.i18n.defaultNamespace),

  keySeparator: field.string().default(ApiKitAppDefaults.i18n.keySeparator),
  nsSeparator: field.string().default(ApiKitAppDefaults.i18n.nsSeparator),
  pluralSeparator: field.string().default(ApiKitAppDefaults.i18n.pluralSeparator),
  contextSeparator: field.string().default(ApiKitAppDefaults.i18n.contextSeparator),
});

export type I18nConfig = InferConfiguration<typeof I18nConfiguration>;
