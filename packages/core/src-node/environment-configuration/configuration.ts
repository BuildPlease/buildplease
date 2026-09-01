import { type EnvironmentRegistry, defineEnvironments } from './environment';
import type { ConfigurationSource } from './source';

// MARK: - Symbols

const CONFIGURATION_FIELD = Symbol.for('buildplease.environment-configuration.field');
const CONFIGURATION_CONTRACT = Symbol.for('buildplease.environment-configuration.contract');
const CONFIGURATION_BINDING = Symbol.for('buildplease.environment-configuration.binding');
const CONFIG_DEFINITION = Symbol.for('buildplease.environment-configuration.config');

// MARK: - Fields

export interface ConfigurationField<Output, Required extends boolean = true, Input = Output> {
  readonly required: Required;
  readonly hasDefault: boolean;
  readonly defaultValue?: Output;

  parse(value: unknown, path: string): Output;

  optional(): ConfigurationField<Output | undefined, false, Input | undefined | null>;
  default(value: Output): ConfigurationField<Output, false, Input>;

  map<NextOutput>(transform: (value: Output) => NextOutput): ConfigurationField<NextOutput, Required, Input>;
}

export const field = {
  string() {
    return makeField<string, true, string>(
      (value, path) => {
        if (typeof value !== 'string') throw new Error(`${path} must be string.`);

        const trimmed = value.trim();
        if (!trimmed) throw new Error(`${path} must not be empty.`);

        return trimmed;
      },
      { required: true },
    );
  },

  number() {
    return makeField<number, true, string | number>(
      (value, path) => {
        const number = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(number)) throw new Error(`${path} must be number.`);

        return number;
      },
      { required: true },
    );
  },

  boolean() {
    return makeField<boolean, true, string | boolean>(
      (value, path) => {
        if (typeof value === 'boolean') return value;

        if (typeof value === 'string') {
          const normalized = value.trim().toLowerCase();

          if (normalized === 'true') return true;
          if (normalized === 'false') return false;
        }

        throw new Error(`${path} must be boolean.`);
      },
      { required: true },
    );
  },

  array<Item, ItemInput>(item: ConfigurationField<Item, boolean, ItemInput>) {
    return makeField<readonly Item[], true, readonly ItemInput[]>(
      (value, path) => {
        if (!Array.isArray(value)) throw new Error(`${path} must be array.`);

        return value.map((entry, index) => item.parse(entry, `${path}[${index}]`));
      },
      { required: true },
    );
  },

  custom<T>() {
    return makeField<T, true, T>((value) => value as T, { required: true });
  },
};

// MARK: - Reusable configurations

export type ConfigurationSchema =
  ConfigurationField<any, boolean, any> | { readonly [key: string]: ConfigurationSchema };

export type InferSchemaOutput<Schema> =
  Schema extends ConfigurationField<infer Output, any, any>
    ? Output
    : Schema extends object
      ? { readonly [Key in keyof Schema]: InferSchemaOutput<Schema[Key]> }
      : never;

export type InferSchemaInput<Schema> =
  Schema extends ConfigurationField<any, any, infer Input>
    ? Input
    : Schema extends object
      ? {
          readonly [Key in RequiredSchemaKeys<Schema>]: InferSchemaInput<Schema[Key]>;
        } & {
          readonly [Key in OptionalSchemaKeys<Schema>]?: InferSchemaInput<Schema[Key]>;
        }
      : never;

export type ConfigurationValueInput<T> =
  ConfigurationSource<T | undefined> | (T extends unknown ? ConfigurationValueInputValue<T> : never);

export type ConfigurationInputFromSchema<Schema> =
  | ConfigurationSource<InferSchemaInput<Schema> | undefined>
  | (Schema extends ConfigurationField<any, any, infer Input>
      ? ConfigurationValueInput<Input>
      : Schema extends object
        ? {
            readonly [Key in RequiredSchemaKeys<Schema>]: ConfigurationInputFromSchema<Schema[Key]>;
          } & {
            readonly [Key in OptionalSchemaKeys<Schema>]?: ConfigurationInputFromSchema<Schema[Key]>;
          }
        : never);

export interface ConfigurationContract<Output, Schema extends ConfigurationSchema = ConfigurationSchema> {
  readonly key: string;
  readonly schema: Schema;

  (input: ConfigurationInputFromSchema<Schema>): ConfigurationBinding<Output, Schema>;
}

export interface ConfigurationBinding<Output = unknown, Schema extends ConfigurationSchema = ConfigurationSchema> {
  readonly contract: ConfigurationContract<Output, Schema>;
  readonly input: ConfigurationInputFromSchema<Schema>;
}

export type InferConfiguration<Contract> = Contract extends ConfigurationContract<infer Output, any> ? Output : never;

export function defineConfiguration<const Schema extends ConfigurationSchema>(
  key: string,
  schema: Schema,
): ConfigurationContract<InferSchemaOutput<Schema>, Schema> {
  const normalizedKey = key.trim();
  if (!normalizedKey) throw new Error('Configuration key must not be empty.');

  type Output = InferSchemaOutput<Schema>;

  const contract = ((input: ConfigurationInputFromSchema<Schema>) => {
    const binding: ConfigurationBinding<Output, Schema> = {
      contract: contract,
      input: input,
    };

    Object.defineProperty(binding, CONFIGURATION_BINDING, { value: true });

    return binding;
  }) as ConfigurationContract<Output, Schema>;

  Object.defineProperties(contract, {
    [CONFIGURATION_CONTRACT]: { value: true },
    key: { value: normalizedKey },
    schema: { value: schema },
  });

  return contract;
}

// MARK: - Root configs

export interface ConfigDefinition<Environments extends EnvironmentRegistry = EnvironmentRegistry, Input = unknown> {
  readonly environments: Environments;
  readonly input: Input;
}

export type InferConfig<Config> = Config extends ConfigDefinition<any, infer Input> ? InferConfigValue<Input> : never;

export type InferConfigValue<Input> =
  Input extends ConfigurationSource<infer Output>
    ? Output
    : Input extends ConfigurationBinding<infer Output>
      ? Output
      : Input extends (...args: any[]) => any
        ? Input
        : Input extends readonly [unknown, ...unknown[]]
          ? { readonly [Key in keyof Input]: InferConfigValue<Input[Key]> }
          : Input extends readonly (infer Item)[]
            ? readonly InferConfigValue<Item>[]
            : Input extends object
              ? { readonly [Key in keyof Input]: InferConfigValue<Input[Key]> }
              : Input;

export function defineCoreConfig<const Environments extends EnvironmentRegistry, const Input>(
  environments: Environments,
  input: Input,
): ConfigDefinition<Environments, Input> {
  const config: ConfigDefinition<Environments, Input> = {
    environments: defineEnvironments(environments),
    input: input,
  };

  Object.defineProperty(config, CONFIG_DEFINITION, { value: true });

  return config;
}

// MARK: - Internal

export function isConfigDefinition(input: unknown): input is ConfigDefinition {
  return Boolean(
    input &&
    typeof input === 'object' &&
    (input as { readonly [CONFIG_DEFINITION]?: unknown })[CONFIG_DEFINITION] === true,
  );
}

export function isConfigurationField(input: unknown): input is ConfigurationField<unknown, boolean, unknown> {
  return Boolean(
    input &&
    typeof input === 'object' &&
    (input as { readonly [CONFIGURATION_FIELD]?: unknown })[CONFIGURATION_FIELD] === true,
  );
}

export function isConfigurationContract(input: unknown): input is ConfigurationContract<unknown> {
  return Boolean(
    typeof input === 'function' &&
    (input as unknown as { readonly [CONFIGURATION_CONTRACT]?: unknown })[CONFIGURATION_CONTRACT] === true,
  );
}

export function isConfigurationBinding(input: unknown): input is ConfigurationBinding {
  return Boolean(
    input &&
    typeof input === 'object' &&
    (input as { readonly [CONFIGURATION_BINDING]?: unknown })[CONFIGURATION_BINDING] === true,
  );
}

// MARK: - Private

interface MakeFieldOptions<Output, Required extends boolean> {
  readonly required: Required;
  readonly hasDefault?: boolean;
  readonly defaultValue?: Output;
}

function makeField<Output, Required extends boolean, Input = Output>(
  parse: (value: unknown, path: string) => Output,
  options: MakeFieldOptions<Output, Required>,
): ConfigurationField<Output, Required, Input> {
  const result: ConfigurationField<Output, Required, Input> = {
    required: options.required,
    hasDefault: options.hasDefault ?? false,
    defaultValue: options.defaultValue,

    parse: parse,

    optional() {
      return makeField<Output | undefined, false, Input | undefined | null>(
        (value, path) => {
          if (value === undefined || value === null) return undefined;
          return parse(value, path);
        },
        { required: false },
      );
    },

    default(value: Output) {
      return makeField<Output, false, Input>(parse, {
        required: false,
        hasDefault: true,
        defaultValue: value,
      });
    },

    map<NextOutput>(transform: (value: Output) => NextOutput) {
      const mappedDefault =
        options.hasDefault && options.defaultValue !== undefined ? transform(options.defaultValue) : undefined;

      return makeField<NextOutput, Required, Input>((value, path) => transform(parse(value, path)), {
        required: options.required,
        hasDefault: options.hasDefault,
        defaultValue: mappedDefault,
      });
    },
  };

  Object.defineProperty(result, CONFIGURATION_FIELD, { value: true });

  return result;
}

type ConfigurationValueInputValue<T> = T extends (...args: any[]) => any
  ? T
  : T extends readonly [unknown, ...unknown[]]
    ? { readonly [Key in keyof T]: ConfigurationValueInput<T[Key]> }
    : T extends readonly (infer Item)[]
      ? readonly ConfigurationValueInput<Item>[]
      : T extends object
        ? { readonly [Key in keyof T]: ConfigurationValueInput<T[Key]> }
        : T;

type IsSchemaInputRequired<Schema> =
  Schema extends ConfigurationField<any, infer Required, any>
    ? Required
    : Schema extends object
      ? RequiredSchemaKeys<Schema> extends never
        ? false
        : true
      : true;

type RequiredSchemaKeys<Schema extends object> = {
  [Key in keyof Schema]-?: IsSchemaInputRequired<Schema[Key]> extends true ? Key : never;
}[keyof Schema];

type OptionalSchemaKeys<Schema extends object> = {
  [Key in keyof Schema]-?: IsSchemaInputRequired<Schema[Key]> extends true ? never : Key;
}[keyof Schema];
