import type { Build } from '@/build';
import type { Environment } from '@/environment';

import type { EnvironmentRegistry } from './environment';

// MARK: - Symbols

const CONFIGURATION_SOURCE = Symbol.for('buildplease.environment-configuration.source');
declare const CONFIGURATION_SOURCE_OUTPUT: unique symbol;

// MARK: - Public

export type ConfigurationSourceKind = 'env' | 'by-environment' | 'compute' | 'static' | 'default' | 'required';

export interface ConfigurationResolveContext<EnvironmentName extends string = string> {
  readonly environment: Environment<EnvironmentName>;
  readonly build: Build;
}

type Nullish = null | undefined;

export interface ConfigurationSourceValue<out Output> {
  readonly kind: ConfigurationSourceKind;
  readonly options: unknown;
  readonly transforms: readonly ConfigurationSourceTransform[];
  readonly [CONFIGURATION_SOURCE_OUTPUT]?: Output;
}

interface ConfigurationSourceBase<Output> extends ConfigurationSourceValue<Output> {
  map<NextOutput>(transform: (value: Output) => NextOutput | Promise<NextOutput>): ConfigurationSource<NextOutput>;
}

interface OptionalConfigurationSource<Output> {
  default<Default>(value: Default): ConfigurationSource<Exclude<Output, Nullish> | Default>;
  required(message?: string): ConfigurationSource<Exclude<Output, Nullish>>;
}

export type ConfigurationSource<Output = unknown> = ConfigurationSourceBase<Output> &
  ([Extract<Output, Nullish>] extends [never] ? unknown : OptionalConfigurationSource<Output>);

export function defineSource<const Environments extends EnvironmentRegistry>(_environments: Environments) {
  type EnvironmentName = keyof Environments & string;

  return {
    env(name: string): ConfigurationSource<string | undefined> {
      return makeSource('env', { name: name });
    },

    byEnvironment<const Cases extends { readonly [Key in EnvironmentName]: unknown }>(
      cases: Cases,
    ): ConfigurationSource<InferSourceOutput<Cases[EnvironmentName]>> {
      return makeSource('by-environment', { cases: cases });
    },

    compute<Output>(
      compute: (context: ConfigurationResolveContext<EnvironmentName>) => Output | Promise<Output>,
    ): ConfigurationSource<Output> {
      return makeSource('compute', { compute: compute });
    },

    static<Output>(value: Output): ConfigurationSource<Output> {
      return makeSource('static', { value: value });
    },
  };
}

// MARK: - Internal

export function isConfigurationSource(input: unknown): input is ConfigurationSource {
  return Boolean(
    input &&
    typeof input === 'object' &&
    (input as { readonly [CONFIGURATION_SOURCE]?: unknown })[CONFIGURATION_SOURCE] === true,
  );
}

// MARK: - Private

type ConfigurationSourceTransform = (value: unknown) => unknown | Promise<unknown>;

type InferSourceOutput<T> =
  T extends ConfigurationSourceValue<infer Output>
    ? Output
    : T extends (...args: any[]) => any
      ? T
      : T extends readonly [unknown, ...unknown[]]
        ? { readonly [Key in keyof T]: InferSourceOutput<T[Key]> }
        : T extends readonly (infer Item)[]
          ? readonly InferSourceOutput<Item>[]
          : T extends object
            ? { readonly [Key in keyof T]: InferSourceOutput<T[Key]> }
            : T;

interface ConfigurationSourceImplementation<Output>
  extends ConfigurationSourceBase<Output>, OptionalConfigurationSource<Output> {}

function makeSource<Output>(
  kind: ConfigurationSourceKind,
  options: unknown,
  transforms: readonly ConfigurationSourceTransform[] = [],
): ConfigurationSource<Output> {
  const result: ConfigurationSourceImplementation<Output> = {
    kind: kind,
    options: options,
    transforms: transforms,

    default<Default>(value: Default) {
      return makeSource<Exclude<Output, Nullish> | Default>('default', {
        source: result,
        value: value,
      });
    },

    required(message?: string) {
      return makeSource<Exclude<Output, Nullish>>('required', {
        source: result,
        message: message,
      });
    },

    map<NextOutput>(transform: (value: Output) => NextOutput | Promise<NextOutput>) {
      return makeSource<NextOutput>(kind, options, [...transforms, transform as ConfigurationSourceTransform]);
    },
  };

  Object.defineProperty(result, CONFIGURATION_SOURCE, { value: true });

  return result as ConfigurationSource<Output>;
}
