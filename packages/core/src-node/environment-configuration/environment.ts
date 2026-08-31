import { validateEnvironmentName } from '@src-internal/environment-configuration/validate-environment-name';
import { resolvePath } from '@src-node/file';

import type { Environment } from '@/environment';

// MARK: - Public

export interface EnvironmentDefinition {
  /** Optional public/static alias for this environment. */
  readonly alias?: string;

  /**
   * Optional dotenv file associated with this environment.
   *
   * When the environment is selected, the runtime loads this file if it exists.
   * Missing files are ignored, values already present in `process.env` keep
   * priority. Configuration resolution and defaults decide how missing values are handled.
   */
  readonly file?: string;

  /** Directory containing `file`, resolved relative to `environment.config.ts`. */
  readonly fileDir?: string;
}

interface EnvironmentSource<Name extends string = string> extends Environment<Name> {
  readonly file?: string;
  readonly fileDir: string;
}

export type EnvironmentRegistry = Record<string, EnvironmentDefinition>;

export type EnvironmentName<Environments extends EnvironmentRegistry> = keyof Environments & string;

export type EnvironmentFromRegistry<Environments extends EnvironmentRegistry> = Environment<
  EnvironmentName<Environments>
>;

export interface ResolveEnvironmentOptions {
  readonly baseDir?: string;
}

export function defineEnvironments<const Environments extends EnvironmentRegistry>(
  environments: Environments,
): Environments {
  if (!isPlainObject(environments)) throw new Error('Environment registry must be an object.');

  const entries = Object.entries(environments) as Array<[string, EnvironmentDefinition]>;

  if (!entries.length) throw new Error('At least one environment must be defined.');

  for (const [name, environment] of entries) {
    validateEnvironmentName(name);
    validateEnvironmentDefinition(name, environment);
  }

  return environments;
}

export function resolveEnvironment<Environments extends EnvironmentRegistry>(
  environments: Environments,
  name: string,
): EnvironmentFromRegistry<Environments> {
  validateEnvironmentName(name);
  const environment = requireEnvironmentDefinition(environments, name);

  return {
    name: name as EnvironmentName<Environments>,
    alias: environment.alias?.trim() || undefined,
  };
}

export function resolveEnvironmentSource<Environments extends EnvironmentRegistry>(
  environments: Environments,
  name: string,
  options: ResolveEnvironmentOptions = {},
): EnvironmentSource<EnvironmentName<Environments>> {
  validateEnvironmentName(name);
  const environment = requireEnvironmentDefinition(environments, name);
  const baseDir = options.baseDir?.trim() || process.cwd();
  const fileDir = resolvePath(baseDir, environment.fileDir?.trim() || '.');

  return {
    name: name as EnvironmentName<Environments>,
    alias: environment.alias?.trim() || undefined,
    file: environment.file?.trim() || undefined,
    fileDir: fileDir,
  };
}

function requireEnvironmentDefinition<Environments extends EnvironmentRegistry>(
  environments: Environments,
  name: string,
): EnvironmentDefinition {
  if (!Object.prototype.hasOwnProperty.call(environments, name)) {
    throw new Error(`Environment "${name}" is not configured.`);
  }

  const environment = environments[name];

  if (!environment) throw new Error(`Environment "${name}" is not configured.`);

  return environment;
}

// MARK: - Private

function validateEnvironmentDefinition(name: string, environment: EnvironmentDefinition): void {
  if (!isPlainObject(environment)) {
    throw new Error(`Environment definition must be an object for "${name}".`);
  }

  if (environment.alias !== undefined && (typeof environment.alias !== 'string' || !environment.alias.trim())) {
    throw new Error(`Environment alias must not be empty for "${name}".`);
  }

  if (environment.file !== undefined && (typeof environment.file !== 'string' || !environment.file.trim())) {
    throw new Error(`Environment file must not be empty for "${name}".`);
  }

  if (environment.fileDir !== undefined && (typeof environment.fileDir !== 'string' || !environment.fileDir.trim())) {
    throw new Error(`Environment file directory must not be empty for "${name}".`);
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false;

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}
