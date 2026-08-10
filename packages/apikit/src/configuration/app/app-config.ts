import {
  type BasicAuthConfiguration,
  type BuildConfiguration,
  type CorsConfiguration,
  type EmailConfiguration,
  type HealthConfiguration,
  type I18nConfiguration,
  type LoggerConfiguration,
  type MetricsConfiguration,
  type MultipartConfiguration,
  type NotificationConfiguration,
  type ServerConfiguration,
  type StaticFilesConfiguration,
} from './configs';
import type {
  ConfigurationBinding,
  ConfigurationContract,
  ConfigurationInputFromSchema,
  ConfigurationSchema,
} from '../core/configuration';
import type { EnvironmentRegistry } from '../core/environments';

// MARK: - Public

export interface DefineApiKitInput {
  readonly build?: InputOf<typeof BuildConfiguration>;

  readonly server: InputOf<typeof ServerConfiguration>;
  readonly logger?: InputOf<typeof LoggerConfiguration>;
  readonly metrics?: InputOf<typeof MetricsConfiguration>;
  readonly health?: InputOf<typeof HealthConfiguration>;
  readonly email?: InputOf<typeof EmailConfiguration>;
  readonly notification?: InputOf<typeof NotificationConfiguration>;
  readonly i18n?: InputOf<typeof I18nConfiguration>;
  readonly staticFiles?: InputOf<typeof StaticFilesConfiguration>;
  readonly basicAuth?: InputOf<typeof BasicAuthConfiguration>;
  readonly cors?: InputOf<typeof CorsConfiguration>;
  readonly multipart?: InputOf<typeof MultipartConfiguration>;

  readonly configurations?: readonly ExtensionConfigurationBinding[];
}

export interface ApiKitConfig<
  Environments extends EnvironmentRegistry = EnvironmentRegistry,
> extends DefineApiKitInput {
  readonly environments: Environments;
  readonly configurations: readonly ExtensionConfigurationBinding[];
}

// MARK: - Private

type InputOf<Contract extends ConfigurationContract<any, ConfigurationSchema>> =
  Contract extends ConfigurationContract<any, infer Schema> ? ConfigurationInputFromSchema<Schema> : never;

type ExtensionConfigurationBinding = ConfigurationBinding<any, any>;
