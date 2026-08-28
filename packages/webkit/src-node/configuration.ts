import {
  type ConfigDefinition,
  type EnvironmentRegistry,
  defineConfig as defineCoreConfig,
} from '@buildplease/core/node';

export type WebKitConfigurationInput = Readonly<Record<string, unknown>>;

export function defineWebKitConfiguration<
  const Environments extends EnvironmentRegistry,
  const Input extends WebKitConfigurationInput,
>(environments: Environments, input: Input): ConfigDefinition<Environments, Input> {
  return defineCoreConfig(environments, input);
}
