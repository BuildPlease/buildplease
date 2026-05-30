import { type ConfigurationField } from './field';
import type { ConfigurationSource } from './source';

// MARK: - Symbols

const CONFIGURATION_CONTRACT = Symbol('apikit.configuration.contract');
const CONFIGURATION_BINDING = Symbol('apikit.configuration.binding');

// MARK: - Public

export type ConfigurationSchema =
  | ConfigurationField<any, boolean, any>
  | { readonly [key: string]: ConfigurationSchema };

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
  | ConfigurationSource<T | undefined>
  | (T extends unknown ? ConfigurationValueInputValue<T> : never);

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
