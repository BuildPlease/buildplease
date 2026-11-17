import type { ApiKitConfig, DefineApiKitConfigInput } from './config';
import { createConfigDefinition } from './configuration';
import type { EnvironmentRegistry } from './environment';

export function defineApiKitConfig<const Environments extends EnvironmentRegistry>(
  environments: Environments,
  input: DefineApiKitConfigInput,
): ApiKitConfig<Environments> {
  return createConfigDefinition(environments, {
    ...input,
    configurations: input.configurations ?? [],
  });
}
