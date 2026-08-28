import type { BuildMetadata } from '../build-metadata';
import type { EnvironmentConfig, EnvironmentRegistry } from './environment';

// MARK: - Symbols

const CONFIGURATION_SOURCE = Symbol.for('buildplease.environment-configuration.source');

// MARK: - Public

export type ConfigurationSourceKind = 'env' | 'by-environment' | 'compute' | 'static' | 'default';

export interface ConfigurationResolveContext<EnvironmentName extends string = string> {
  readonly environment: EnvironmentConfig<EnvironmentName>;
  readonly buildMetadata: BuildMetadata;
}

export interface ConfigurationSource<Output = unknown> {
  readonly kind: ConfigurationSourceKind;
  readonly options: unknown;
  readonly transforms: readonly ConfigurationSourceTransform[];

  default<Default>(value: Default): ConfigurationSource<Exclude<Output, null | undefined> | Default>;

  map<NextOutput>(transform: (value: Output) => NextOutput | Promise<NextOutput>): ConfigurationSource<NextOutput>;
}

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
  T extends ConfigurationSource<infer Output>
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

function makeSource<Output>(
  kind: ConfigurationSourceKind,
  options: unknown,
  transforms: readonly ConfigurationSourceTransform[] = [],
): ConfigurationSource<Output> {
  const result: ConfigurationSource<Output> = {
    kind: kind,
    options: options,
    transforms: transforms,

    default<Default>(value: Default) {
      return makeSource<Exclude<Output, null | undefined> | Default>('default', {
        source: result,
        value: value,
      });
    },

    map<NextOutput>(transform: (value: Output) => NextOutput | Promise<NextOutput>) {
      return makeSource<NextOutput>(kind, options, [...transforms, transform as ConfigurationSourceTransform]);
    },
  };

  Object.defineProperty(result, CONFIGURATION_SOURCE, { value: true });

  return result;
}
