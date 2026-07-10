import type { ApiKitConfig, DefineApiKitInput } from './app-config';
import type { EnvironmentRegistry } from '../core/environments';

// MARK: - Public

export function defineApiKit<const Environments extends EnvironmentRegistry>(
  environments: Environments,
  input: DefineApiKitInput,
): ApiKitConfig<Environments> {
  return {
    ...input,
    environments: environments,
    configurations: input.configurations ?? [],
  };
}
