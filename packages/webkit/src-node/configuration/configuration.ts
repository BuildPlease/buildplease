import { type ConfigDefinition, type EnvironmentRegistry, defineCoreConfig } from '@buildplease/core/node';

export type WebKitConfigurationInput = Readonly<Record<string, unknown>>;

export function defineWebKitConfig<
  const Environments extends EnvironmentRegistry,
  const Input extends WebKitConfigurationInput,
>(environments: Environments, input: Input): ConfigDefinition<Environments, Input> {
  return defineCoreConfig(environments, input);
}
