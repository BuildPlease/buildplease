import { type EnvironmentRegistry, defineConfig as defineCoreConfig } from '@buildplease/core/node';

import type { ApiKitConfig, DefineApiKitConfigInput } from './config';

// MARK: - Internal

export function defineApiKitConfiguration<const Environments extends EnvironmentRegistry>(
  environments: Environments,
  input: DefineApiKitConfigInput,
): ApiKitConfig<Environments> {
  return defineCoreConfig(environments, {
    ...input,
    configurations: input.configurations ?? [],
  });
}
