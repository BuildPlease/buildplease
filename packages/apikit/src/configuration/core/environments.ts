// MARK: - Public

export interface EnvironmentDefinition {
  readonly file: string;
  readonly fileDir?: string;
}

export interface EnvironmentConfig<Name extends string = string> {
  readonly name: Name;
  readonly file: string;
  readonly fileDir: string;
}

export type EnvironmentRegistry = Record<string, EnvironmentDefinition>;

export type EnvironmentName<Environments extends EnvironmentRegistry> = keyof Environments & string;

export type EnvironmentConfigFromRegistry<Environments extends EnvironmentRegistry> = EnvironmentConfig<
  EnvironmentName<Environments>
>;

export interface ResolveEnvironmentOptions {
  readonly fileDir?: string;
}

export function defineEnvironments<const Environments extends EnvironmentRegistry>(
  environments: Environments,
): Environments {
  const entries = Object.entries(environments) as Array<[string, EnvironmentDefinition]>;

  if (!entries.length) throw new Error('At least one environment must be defined.');

  for (const [name, environment] of entries) {
    validateEnvironmentDefinition(name, environment);
  }

  return environments;
}

// MARK: - Internal

export function resolveEnvironment<Environments extends EnvironmentRegistry>(
  environments: Environments,
  name: string,
  options: ResolveEnvironmentOptions = {},
): EnvironmentConfigFromRegistry<Environments> {
  const environment = environments[name];

  if (!environment) throw new Error(`Environment "${name}" is not defined.`);

  return {
    name: name as EnvironmentName<Environments>,
    file: environment.file.trim(),
    fileDir: environment.fileDir?.trim() || options.fileDir?.trim() || process.cwd(),
  };
}

// MARK: - Private

function validateEnvironmentDefinition(name: string, environment: EnvironmentDefinition): void {
  if (!name.trim()) throw new Error('Environment name must not be empty.');

  if (typeof environment.file !== 'string' || !environment.file.trim()) {
    throw new Error(`Environment file must not be empty for "${name}".`);
  }
}
