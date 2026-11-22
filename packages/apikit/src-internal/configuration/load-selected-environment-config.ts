import fs from 'node:fs';
import { dirname } from 'node:path';

import type { Environment } from '@buildplease/core';
import {
  type ConfigDefinition,
  type EnvironmentFromRegistry,
  type EnvironmentRegistry,
  resolveEnvironment,
  resolvePath,
} from '@buildplease/core/node';
import dotenvx from '@dotenvx/dotenvx';

import { type LoadedConfig, type LoadEnvironmentConfigOptions, loadEnvironmentConfig } from './load-environment-config';
import { loadPreparedEnvironments } from './prepared-environment';
import { readSelectedEnvironmentName } from './selection';

export interface LoadedEnvironmentConfig<
  Config extends ConfigDefinition = ConfigDefinition,
> extends LoadedConfig<Config> {
  readonly environment: EnvironmentFromRegistry<Config['environments']>;
}

export async function loadSelectedEnvironmentConfig<Config extends ConfigDefinition = ConfigDefinition>(
  options: LoadEnvironmentConfigOptions = {},
): Promise<LoadedEnvironmentConfig<Config>> {
  const environmentName = readSelectedEnvironmentName();
  const loaded = await loadEnvironmentConfig<Config>(options);
  const preparedEnvironments = await loadPreparedEnvironments(loaded.rootDir);

  validatePreparedEnvironments(loaded.config.environments, preparedEnvironments);

  const preparedEnvironment = preparedEnvironments[environmentName];
  if (!preparedEnvironment) throw new Error(`Environment "${environmentName}" is not configured.`);

  try {
    const environmentSource = loaded.config.environments[environmentName];
    if (!environmentSource) throw new Error(`Environment "${environmentName}" is not configured.`);

    if (environmentSource.file) {
      const fileDir = resolvePath(dirname(loaded.configFilePath), environmentSource.fileDir?.trim() || '.');
      const environmentFilePath = resolvePath(fileDir, environmentSource.file.trim());

      if (fs.existsSync(environmentFilePath)) {
        dotenvx.config({
          path: environmentFilePath,
          overload: false,
          quiet: true,
        });
      }
    }

    return {
      ...loaded,
      environment: preparedEnvironment as EnvironmentFromRegistry<Config['environments']>,
    };
  } catch (error) {
    throw new Error(`Failed to load environment.config.ts: ${error instanceof Error ? error.message : String(error)}`, {
      cause: error,
    });
  }
}

function validatePreparedEnvironments(
  source: EnvironmentRegistry,
  prepared: Readonly<Record<string, Environment>>,
): void {
  const sourceEntries = Object.entries(source);
  const preparedNames = Object.keys(prepared);

  if (sourceEntries.length !== preparedNames.length) throw makeStaleEnvironmentError();

  for (const [name] of sourceEntries) {
    const sourceEnvironment = resolveEnvironment(source, name);
    const preparedEnvironment = prepared[name];

    if (
      !preparedEnvironment ||
      preparedEnvironment.name !== sourceEnvironment.name ||
      preparedEnvironment.alias !== sourceEnvironment.alias
    ) {
      throw makeStaleEnvironmentError();
    }
  }
}

function makeStaleEnvironmentError(): Error {
  return new Error('Prepared environments do not match configured environments.');
}
