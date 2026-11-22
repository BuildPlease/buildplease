export * from '@buildplease/core/node';
export {
  defineSource,
  defineWebKitConfig,
  resolveWebKitConfig,
  resolveWebKitPublicConfig,
  isWebKitEnvironmentVariable,
} from '@neutral/configuration';
export type {
  WebKitConfigDefinition,
  WebKitEnvironmentFields,
  WebKitEnvironmentField,
  WebKitEnvironmentValues,
  WebKitEnvironmentVariable,
  InferWebKitConfig,
  InferWebKitPublicConfig,
} from '@neutral/configuration';
export * from './configuration';
