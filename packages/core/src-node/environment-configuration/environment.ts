import { resolvePath } from '@src-node/file';

// MARK: - Public

export interface EnvironmentDefinition {
  /**
   * Optional dotenv file associated with this environment.
   *
   * When the environment is selected, BuildPlease loads this file if it exists.
   * Missing files are ignored, values already present in `process.env` keep
   * priority. Configuration resolution and defaults decide how missing values are handled.
   */
  readonly file?: string;

  /** Directory containing `file`, resolved relative to `environment.config.ts`. */
  readonly fileDir?: string;
}

export interface EnvironmentConfig<Name extends string = string> {
  readonly name: Name;
  readonly file?: string;
  readonly fileDir: string;
}

export type EnvironmentRegistry = Record<string, EnvironmentDefinition>;

export type EnvironmentName<Environments extends EnvironmentRegistry> = keyof Environments & string;

export type EnvironmentConfigFromRegistry<Environments extends EnvironmentRegistry> = EnvironmentConfig<
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
    validateEnvironmentDefinition(name, environment);
  }

  return environments;
}

export function resolveEnvironment<Environments extends EnvironmentRegistry>(
  environments: Environments,
  name: string,
  options: ResolveEnvironmentOptions = {},
): EnvironmentConfigFromRegistry<Environments> {
  if (!Object.prototype.hasOwnProperty.call(environments, name)) {
    throw new Error(`Environment "${name}" is not defined.`);
  }

  const environment = environments[name];

  if (!environment) throw new Error(`Environment "${name}" is not defined.`);

  const baseDir = options.baseDir?.trim() || process.cwd();
  const fileDir = resolvePath(baseDir, environment.fileDir?.trim() || '.');

  return {
    name: name as EnvironmentName<Environments>,
    file: environment.file?.trim() || undefined,
    fileDir: fileDir,
  };
}

// MARK: - Private

function validateEnvironmentDefinition(name: string, environment: EnvironmentDefinition): void {
  if (!name.trim()) throw new Error('Environment name must not be empty.');

  if (!isPlainObject(environment)) {
    throw new Error(`Environment definition must be an object for "${name}".`);
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
