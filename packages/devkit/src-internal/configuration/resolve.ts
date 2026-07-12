import { DevKitDefaults } from './defaults';
import type { DevKitConfig, DevKitConfigMode } from '../../src/configuration';

export interface ResolvedDevKitConfig {
  readonly ignore: readonly string[];
  readonly clean: {
    readonly targets: readonly string[];
    readonly directories: readonly string[];
  };
  readonly format: {
    readonly include: readonly string[];
  };
  readonly lint: {
    readonly include: readonly string[];
  };
}

export function resolveDevKitConfig(config: DevKitConfig): ResolvedDevKitConfig {
  return {
    ignore: resolveList(DevKitDefaults.ignore, config.ignore, DevKitDefaults.mode),
    clean: {
      targets: resolveList(
        DevKitDefaults.clean.targets,
        config.clean.targets,
        config.clean.mode ?? DevKitDefaults.clean.mode,
      ),
      directories: resolveList(
        DevKitDefaults.clean.directories,
        config.clean.directories,
        config.clean.mode ?? DevKitDefaults.clean.mode,
      ),
    },
    format: {
      include: resolveList(
        DevKitDefaults.format.include,
        config.format.include,
        config.format.mode ?? DevKitDefaults.format.mode,
      ),
    },
    lint: {
      include: resolveList(
        DevKitDefaults.lint.include,
        config.lint.include,
        config.lint.mode ?? DevKitDefaults.lint.mode,
      ),
    },
  };
}

function resolveList(
  defaults: readonly string[],
  input: readonly string[] | undefined,
  mode: DevKitConfigMode,
): readonly string[] {
  const values = mode === 'override' ? (input ?? []) : [...defaults, ...(input ?? [])];

  return [...new Set(values)];
}
