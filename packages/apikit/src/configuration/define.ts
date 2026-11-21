import { type EnvironmentRegistry, defineCoreConfig } from '@buildplease/core/node';

import type { ApiKitConfig, DefineApiKitConfigInput } from './config';

export function defineApiKitConfig<const Environments extends EnvironmentRegistry>(
  environments: Environments,
  input: DefineApiKitConfigInput,
): ApiKitConfig<Environments> {
  return defineCoreConfig(environments, {
    ...input,
    configurations: input.configurations ?? [],
  });
}
