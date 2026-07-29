import type { BuildMetadata } from '@/configuration/core/build-metadata';
import {
  type ConfigurationBinding,
  type ConfigurationContract,
  type ConfigurationInputFromSchema,
  type ConfigurationSchema,
  isConfigurationBinding,
} from '@/configuration/core/configuration';
import type { EnvironmentConfig } from '@/configuration/core/environments';
import { type ConfigurationField, isConfigurationField } from '@/configuration/core/field';
import {
  type ConfigurationResolveContext,
  type ConfigurationSource,
  isConfigurationSource,
} from '@/configuration/core/source';

export interface ResolveConfigurationOptions {
  readonly buildMetadata?: BuildMetadata;
  readonly environment?: EnvironmentConfig;
}

export async function resolveConfiguration<Output, Schema extends ConfigurationSchema>(
  contract: ConfigurationContract<Output, Schema>,
  input: ConfigurationInputFromSchema<Schema> | undefined,
  options: ResolveConfigurationOptions = {},
): Promise<Output> {
  const context: InternalResolveContext = {
    buildMetadata: options.buildMetadata,
    environment: options.environment,
  };

  return resolveSchema(contract.schema, input, context, contract.key) as Promise<Output>;
}

export async function resolveConfigurationBinding<Output>(
  binding: ConfigurationBinding<Output>,
  options: ResolveConfigurationOptions,
): Promise<Output> {
  return resolveConfiguration(binding.contract, binding.input, options);
}

type InternalResolveContext = Omit<ConfigurationResolveContext, 'buildMetadata' | 'environment'> & {
  readonly buildMetadata?: BuildMetadata;
  readonly environment?: EnvironmentConfig;
};

async function resolveSchema(
  schema: ConfigurationSchema,
  input: unknown,
  context: InternalResolveContext,
  path: string,
): Promise<unknown> {
  if (isConfigurationField(schema)) return resolveField(schema, input, context, path);

  const resolvedInput = await resolveValue(input, context, path);
  const source = resolvedInput ?? {};

  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    throw new Error(`${path} must be object.`);
  }

  const result: Record<string, unknown> = {};

  for (const [key, childSchema] of Object.entries(schema)) {
    result[key] = await resolveSchema(childSchema, (source as Record<string, unknown>)[key], context, `${path}.${key}`);
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

  if (input && typeof input === 'object') {
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
      const raw = process.env[name];

      value = typeof raw === 'string' && raw.trim() ? raw.trim() : undefined;
      break;
    }

    case 'by-environment': {
      if (!context.environment) throw new Error(`${path} requires runtime environment.`);

      const { cases } = source.options as { readonly cases: Record<string, unknown> };

      value = await resolveValue(cases[context.environment.name], context, path);
      break;
    }

    case 'compute': {
      if (!context.environment) throw new Error(`${path} requires runtime environment.`);
      if (!context.buildMetadata) throw new Error(`${path} requires build metadata.`);

      const { compute } = source.options as {
        readonly compute: (context: ConfigurationResolveContext) => unknown | Promise<unknown>;
      };

      value = await compute(context as ConfigurationResolveContext);
      break;
    }

    case 'static': {
      const { value: raw } = source.options as { readonly value: unknown };

      value = raw;
      break;
    }
  }

  for (const transform of source.transforms) {
    if (!context.environment) throw new Error(`${path} source transforms require runtime environment.`);
    if (!context.buildMetadata) throw new Error(`${path} source transforms require build metadata.`);

    value = await transform(value, context as ConfigurationResolveContext);
  }

  return value;
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
  return Object.prototype.toString.call(value) === '[object Object]';
}
