import type { ApiKitConfig, DefineApiKitInput } from './apikit-config';
import type { EnvironmentRegistry } from './core/environments';

// MARK: - Public

export function defineApikit<const Environments extends EnvironmentRegistry>(
  environments: Environments,
  input: DefineApiKitInput,
): ApiKitConfig<Environments> {
  return {
    ...input,
    environments: environments,
    configurations: input.configurations ?? [],
  };
}
