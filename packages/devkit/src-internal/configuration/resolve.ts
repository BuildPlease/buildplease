import { DevKitDefaults } from './defaults';
import type { DevKitConfig, DevKitConfigMode } from '../../src/configuration';

export interface ResolvedDevKitConfig {
  readonly clean: {
    readonly targets: readonly string[];
    readonly directories: readonly string[];
  };
  readonly prettier: {
    readonly include: readonly string[];
    readonly ignore: readonly string[];
  };
  readonly eslint: {
    readonly include: readonly string[];
    readonly ignore: readonly string[];
  };
}

export function resolveDevKitConfig(config: DevKitConfig): ResolvedDevKitConfig {
  return {
    clean: {
      targets: DevKitDefaults.clean.targets,
      directories: resolveList(DevKitDefaults.clean.directories, config.clean.directories, config.clean.mode),
    },
    prettier: {
      include: resolveList(DevKitDefaults.prettier.include, config.prettier.include, config.prettier.mode),
      ignore: resolveList(DevKitDefaults.prettier.ignore, config.prettier.ignore, config.prettier.mode),
    },
    eslint: {
      include: resolveList(DevKitDefaults.eslint.include, config.eslint.include, config.eslint.mode),
      ignore: resolveList(DevKitDefaults.eslint.ignore, config.eslint.ignore, config.eslint.mode),
    },
  };
}

function resolveList(
  defaults: readonly string[],
  input: readonly string[] | undefined,
  mode: DevKitConfigMode | undefined,
): readonly string[] {
  const values = mode === 'override' ? (input ?? []) : [...defaults, ...(input ?? [])];

  return [...new Set(values)];
}
