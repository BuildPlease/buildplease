import type { EnvironmentConfig } from './environments';

// MARK: - Symbols

const CONFIGURATION_SOURCE = Symbol('apikit.configuration.source');

// MARK: - Public

export type ConfigurationSourceKind = 'env' | 'by-environment' | 'compute' | 'static';

export interface ConfigurationResolveContext<EnvironmentName extends string = string> {
  readonly environment: EnvironmentConfig<EnvironmentName>;

  readonly packageJson?: {
    readonly name?: string;
    readonly version?: string;
  };
}

export interface ConfigurationSource<Output = unknown> {
  readonly kind: ConfigurationSourceKind;
  readonly options: unknown;
  readonly transforms: readonly ConfigurationSourceTransform[];

  map<NextOutput>(
    transform: (value: Output, context: ConfigurationResolveContext) => NextOutput | Promise<NextOutput>,
  ): ConfigurationSource<NextOutput>;
}

export function defineSource<const Environments extends Record<string, unknown>>(
  _environments: Environments,
) {
  type EnvironmentName = keyof Environments & string;

  return {
    env(name: string): ConfigurationSource<string | undefined> {
      return makeSource('env', { name });
    },

    byEnvironment<const Cases extends { readonly [Key in EnvironmentName]: unknown }>(
      cases: Cases,
    ): ConfigurationSource<Cases[EnvironmentName]> {
      return makeSource('by-environment', { cases });
    },

    compute<Output>(
      compute: (context: ConfigurationResolveContext<EnvironmentName>) => Output | Promise<Output>,
    ): ConfigurationSource<Output> {
      return makeSource('compute', { compute });
    },

    static<Output>(value: Output): ConfigurationSource<Output> {
      return makeSource('static', { value });
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

type ConfigurationSourceTransform = (
  value: unknown,
  context: ConfigurationResolveContext,
) => unknown | Promise<unknown>;

function makeSource<Output>(
  kind: ConfigurationSourceKind,
  options: unknown,
  transforms: readonly ConfigurationSourceTransform[] = [],
): ConfigurationSource<Output> {
  const result: ConfigurationSource<Output> = {
    kind: kind,
    options: options,
    transforms: transforms,

    map<NextOutput>(
      transform: (value: Output, context: ConfigurationResolveContext) => NextOutput | Promise<NextOutput>,
    ) {
      return makeSource<NextOutput>(kind, options, [
        ...transforms,
        transform as ConfigurationSourceTransform,
      ]);
    },
  };

  Object.defineProperty(result, CONFIGURATION_SOURCE, { value: true });

  return result;
}
