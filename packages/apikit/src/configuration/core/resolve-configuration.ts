import {
  type ConfigurationBinding,
  type ConfigurationContract,
  type ConfigurationInputFromSchema,
  type ConfigurationSchema,
  isConfigurationBinding,
} from './configuration';
import type { EnvironmentConfig } from './environments';
import { type ConfigurationField, isConfigurationField } from './field';
import { type ConfigurationResolveContext, type ConfigurationSource, isConfigurationSource } from './source';

// MARK: - Public

export interface ResolveConfigurationOptions {
  readonly environment: EnvironmentConfig;

  readonly packageJson?: {
    readonly name?: string;
    readonly version?: string;
  };
}

// MARK: - Internal

export async function resolveConfigurationContract<Output, Schema extends ConfigurationSchema>(
  contract: ConfigurationContract<Output, Schema>,
  input: ConfigurationInputFromSchema<Schema> | undefined,
  options: ResolveConfigurationOptions,
): Promise<Output> {
  const context: ConfigurationResolveContext = {
    environment: options.environment,
    packageJson: options.packageJson,
  };

  return resolveSchema(contract.schema, input, context, contract.key) as Promise<Output>;
}

export async function resolveConfigurationBinding<Output>(
  binding: ConfigurationBinding<Output>,
  options: ResolveConfigurationOptions,
): Promise<Output> {
  return resolveConfigurationContract(binding.contract, binding.input, options);
}

// MARK: - Private

async function resolveSchema(
  schema: ConfigurationSchema,
  input: unknown,
  context: ConfigurationResolveContext,
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
    result[key] = await resolveSchema(
      childSchema,
      (source as Record<string, unknown>)[key],
      context,
      `${path}.${key}`,
    );
  }

  return result;
}

async function resolveField(
  field: ConfigurationField<unknown, boolean, unknown>,
  input: unknown,
  context: ConfigurationResolveContext,
  path: string,
): Promise<unknown> {
  const resolved = await resolveValue(input, context, path);

  if (resolved === undefined || resolved === null) {
    if (field.hasDefault) return field.defaultValue;
    if (!field.required) return undefined;

    throw new Error(`Missing required configuration: ${path}`);
  }

  return field.parse(resolved, path);
}

async function resolveValue(
  input: unknown,
  context: ConfigurationResolveContext,
  path: string,
): Promise<unknown> {
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
  context: ConfigurationResolveContext,
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
      const { cases } = source.options as { readonly cases: Record<string, unknown> };

      value = cases[context.environment.name];
      value = await resolveValue(value, context, path);
      break;
    }

    case 'compute': {
      const { compute } = source.options as {
        readonly compute: (context: ConfigurationResolveContext) => unknown | Promise<unknown>;
      };

      value = await compute(context);
      break;
    }

    case 'static': {
      const { value: raw } = source.options as { readonly value: unknown };

      value = raw;
      break;
    }
  }

  for (const transform of source.transforms) {
    value = await transform(value, context);
  }

  return value;
}
