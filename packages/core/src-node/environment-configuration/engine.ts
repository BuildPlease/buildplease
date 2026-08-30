import fs from 'node:fs';
import { dirname } from 'node:path';

import dotenvx from '@dotenvx/dotenvx';
import { createJiti } from 'jiti';

import type { BuildMetadata } from '../build-metadata';
import {
  type ConfigDefinition,
  type ConfigurationBinding,
  type ConfigurationContract,
  type ConfigurationField,
  type ConfigurationInputFromSchema,
  type ConfigurationSchema,
  type InferConfig,
  isConfigDefinition,
  isConfigurationBinding,
  isConfigurationField,
} from './configuration';
import { type EnvironmentConfig, type EnvironmentConfigFromRegistry, resolveEnvironment } from './environment';
import { readEnvironmentVariable } from './environment-variable';
import { readSelectedEnvironmentName } from '@src-internal/environment-configuration/selection';
import { type ConfigurationResolveContext, type ConfigurationSource, isConfigurationSource } from './source';
import { ensureDirectory, resolvePath } from '../file/file-sync';

const ENVIRONMENT_CONFIG_FILE = 'environment.config.ts';

// MARK: - Public

export interface LoadEnvironmentConfigOptions {
  readonly dir?: string;
}

export interface LoadedConfig<Config extends ConfigDefinition = ConfigDefinition> {
  readonly config: Config;
  readonly configFilePath: string;
  readonly rootDir: string;
}

export interface LoadedEnvironmentConfig<
  Config extends ConfigDefinition = ConfigDefinition,
> extends LoadedConfig<Config> {
  readonly environment: EnvironmentConfigFromRegistry<Config['environments']>;
}

/** Load the conventional environment.config.ts definition without selecting an environment. */
export async function loadEnvironmentConfig<Config extends ConfigDefinition = ConfigDefinition>(
  options: LoadEnvironmentConfigOptions = {},
): Promise<LoadedConfig<Config>> {
  return loadEnvironmentConfigInternal<Config>(options);
}

/**
 * Load environment.config.ts and resolve the environment selected for the
 * current BuildPlease process tree.
 */
export async function loadSelectedEnvironmentConfig<Config extends ConfigDefinition = ConfigDefinition>(
  options: LoadEnvironmentConfigOptions = {},
): Promise<LoadedEnvironmentConfig<Config>> {
  const environmentName = readSelectedEnvironmentName();
  const loaded = await loadEnvironmentConfigInternal<Config>(options);

  try {
    const environment = resolveEnvironment(loaded.config.environments, environmentName, {
      baseDir: dirname(loaded.configFilePath),
    });

    initializeEnvironment(environment);

    return {
      ...loaded,
      environment: environment,
    };
  } catch (error) {
    throw makeLoadError(error);
  }
}

export interface ResolveConfigurationOptions {
  readonly buildMetadata?: BuildMetadata;
  readonly environment?: EnvironmentConfig;
}

export async function resolveConfig<Config extends ConfigDefinition<any>>(
  config: Config,
  context: ConfigurationResolveContext<keyof Config['environments'] & string>,
): Promise<InferConfig<Config>> {
  const resolveContext = requireResolveContext(context, 'config');

  return resolveValue(config.input, resolveContext, 'config') as Promise<InferConfig<Config>>;
}

export async function resolveConfiguration<Output, Schema extends ConfigurationSchema>(
  contract: ConfigurationContract<Output, Schema>,
  input: ConfigurationInputFromSchema<Schema> | undefined,
  options: ResolveConfigurationOptions = {},
): Promise<Output> {
  const context = makeContext(options);

  return resolveSchema(contract.schema, input, context, contract.key) as Promise<Output>;
}

export async function resolveConfigurationBinding<Output>(
  binding: ConfigurationBinding<Output>,
  options: ResolveConfigurationOptions = {},
): Promise<Output> {
  return resolveConfiguration(binding.contract, binding.input, options);
}

// MARK: - Private

async function loadEnvironmentConfigInternal<Config extends ConfigDefinition>(
  options: LoadEnvironmentConfigOptions,
): Promise<LoadedConfig<Config>> {
  const rootDir = resolveRootDir(options.dir);

  try {
    const configFilePath = resolvePath(rootDir, ENVIRONMENT_CONFIG_FILE);

    if (!fs.existsSync(configFilePath)) {
      throw new Error(`Config file "${configFilePath}" does not exist.`);
    }

    const config = await loadConfigExport(rootDir, configFilePath);

    if (!isConfigDefinition(config)) {
      throw new Error(`Environment config must be defined with defineConfig() (${configFilePath}).`);
    }

    return {
      config: config as Config,
      configFilePath: configFilePath,
      rootDir: rootDir,
    };
  } catch (error) {
    throw makeLoadError(error);
  }
}

function resolveRootDir(dir?: string): string {
  const rootDir = dir ? resolvePath(process.cwd(), dir) : process.cwd();

  ensureDirectory(rootDir);

  return rootDir;
}

async function loadConfigExport(rootDir: string, configFilePath: string): Promise<unknown> {
  const jiti = createJiti(rootDir, {
    interopDefault: true,
    extensions: ['.ts'],
    tsconfigPaths: true,
  });

  return jiti.import(configFilePath, { default: true });
}

function initializeEnvironment(environment: { readonly file?: string; readonly fileDir: string }): void {
  if (!environment.file) return;

  const environmentFilePath = resolvePath(environment.fileDir, environment.file);

  if (!fs.existsSync(environmentFilePath)) return;

  dotenvx.config({
    path: environmentFilePath,
    overload: false,
    quiet: true,
  });
}

function makeLoadError(error: unknown): Error {
  return new Error(`Failed to load environment config: ${error instanceof Error ? error.message : String(error)}`, {
    cause: error,
  });
}

type InternalResolveContext = Omit<ConfigurationResolveContext, 'buildMetadata' | 'environment'> & {
  readonly buildMetadata?: BuildMetadata;
  readonly environment?: EnvironmentConfig;
};

function makeContext(options: ResolveConfigurationOptions): InternalResolveContext {
  return {
    buildMetadata: options.buildMetadata,
    environment: options.environment,
  };
}

async function resolveSchema(
  schema: ConfigurationSchema,
  input: unknown,
  context: InternalResolveContext,
  path: string,
): Promise<unknown> {
  if (isConfigurationField(schema)) return resolveField(schema, input, context, path);

  const resolvedInput = await resolveValue(input, context, path);
  const source = resolvedInput ?? {};

  if (!isPlainObject(source)) {
    throw new Error(`${path} must be object.`);
  }

  const result: Record<string, unknown> = {};

  for (const [key, childSchema] of Object.entries(schema)) {
    result[key] = await resolveSchema(childSchema, source[key], context, `${path}.${key}`);
  }

  return result;
}

async function resolveField(
  field: ConfigurationField<unknown, boolean, unknown>,
  input: unknown,
  context: InternalResolveContext,
  path: string,
): Promise<unknown> {
  const resolved = await resolveValue(input, context, path);

  if (resolved === undefined || resolved === null) {
    if (field.hasDefault) return cloneDefault(field.defaultValue);
    if (!field.required) return undefined;

    throw new Error(`Missing required configuration: ${path}`);
  }

  return field.parse(resolved, path);
}

async function resolveValue(input: unknown, context: InternalResolveContext, path: string): Promise<unknown> {
  if (isConfigurationSource(input)) return resolveSource(input, context, path);
  if (isConfigurationBinding(input)) return resolveConfigurationBinding(input, context);

  if (Array.isArray(input)) {
    return Promise.all(input.map((item, index) => resolveValue(item, context, `${path}[${index}]`)));
  }

  if (isPlainObject(input)) {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input)) {
      result[key] = await resolveValue(value, context, `${path}.${key}`);
    }

    return result;
  }

  return input;
}

async function resolveSource(
  source: ConfigurationSource,
  context: InternalResolveContext,
  path: string,
): Promise<unknown> {
  let value: unknown;

  switch (source.kind) {
    case 'env': {
      const { name } = source.options as { readonly name: string };

      value = readEnvironmentVariable(name);
      break;
    }

    case 'by-environment': {
      const environment = requireEnvironment(context, path);
      const { cases } = source.options as { readonly cases: Record<string, unknown> };

      if (!Object.prototype.hasOwnProperty.call(cases, environment.name)) {
        throw new Error(`${path} has no value for environment "${environment.name}".`);
      }

      value = await resolveValue(cases[environment.name], context, path);
      break;
    }

    case 'compute': {
      const resolveContext = requireResolveContext(context, path);
      const { compute } = source.options as {
        readonly compute: (context: ConfigurationResolveContext) => unknown | Promise<unknown>;
      };

      value = await compute(resolveContext);
      break;
    }

    case 'static': {
      const { value: raw } = source.options as { readonly value: unknown };

      value = raw;
      break;
    }

    case 'default': {
      const { source: nested, value: defaultValue } = source.options as {
        readonly source: ConfigurationSource;
        readonly value: unknown;
      };
      const resolved = await resolveSource(nested, context, path);

      value = resolved === undefined || resolved === null ? cloneDefault(defaultValue) : resolved;
      break;
    }
  }

  for (const transform of source.transforms) {
    value = await transform(value);
  }

  return value;
}

function requireEnvironment(context: InternalResolveContext | undefined, path: string): EnvironmentConfig {
  if (!context?.environment) throw new Error(`${path} requires runtime environment.`);

  return context.environment;
}

function requireResolveContext(
  context: InternalResolveContext | ConfigurationResolveContext | undefined,
  path: string,
): ConfigurationResolveContext {
  if (!context?.environment) throw new Error(`${path} requires runtime environment.`);
  if (!context.buildMetadata) throw new Error(`${path} requires build metadata.`);

  return context as ConfigurationResolveContext;
}

function cloneDefault(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => cloneDefault(item));

  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};

    for (const [key, nested] of Object.entries(value)) {
      result[key] = cloneDefault(nested);
    }

    return result;
  }

  return value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false;
  if (Object.prototype.toString.call(value) !== '[object Object]') return false;

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}
