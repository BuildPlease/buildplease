/** ENV key/value source supplied by a build tool, server or Edge host. */
export type WebKitEnvironmentValues = Readonly<Record<string, string | undefined>>;

/** An ENV lookup is a descriptor, not a value resolved during module import. */
export interface WebKitEnvironmentVariable<Fallback extends string | undefined = string | undefined> {
  readonly source: 'env';
  readonly name: string;
  readonly fallback?: Fallback;
}

export interface WebKitEnvironmentField<Name extends string> extends WebKitEnvironmentVariable<undefined> {
  readonly name: Name;
  default<const Fallback extends string>(value: Fallback): WebKitEnvironmentVariable<Fallback>;
}

export interface WebKitEnvironmentFields {
  readonly [key: string]: WebKitEnvironmentVariable | WebKitEnvironmentFields;
}

/** Public values can be serialized to a browser; private values must remain on a trusted host. */
export interface WebKitConfigDefinition<
  Public extends WebKitEnvironmentFields = WebKitEnvironmentFields,
  Private extends WebKitEnvironmentFields = WebKitEnvironmentFields,
> {
  readonly public: Public;
  readonly private: Private;
}

type ResolvedField<Field> =
  Field extends WebKitEnvironmentVariable<infer Fallback>
    ? Fallback extends string
      ? string
      : string | undefined
    : Field extends WebKitEnvironmentFields
      ? { readonly [Key in keyof Field]: ResolvedField<Field[Key]> }
      : never;

export type InferWebKitConfig<Definition extends WebKitConfigDefinition> = {
  readonly public: ResolvedField<Definition['public']>;
  readonly private: ResolvedField<Definition['private']>;
};

export type InferWebKitPublicConfig<Definition extends WebKitConfigDefinition> =
  InferWebKitConfig<Definition>['public'];

export function defineSource(): {
  env<const Name extends string>(name: Name): WebKitEnvironmentField<Name>;
} {
  return {
    env<const Name extends string>(name: Name): WebKitEnvironmentField<Name> {
      if (name.trim().length === 0) {
        throw new Error('ENV variable name must not be empty.');
      }

      const field: WebKitEnvironmentField<Name> = {
        source: 'env',
        name: name,
        default(value) {
          return { source: 'env', name: name, fallback: value };
        },
      };

      // Definitions are JSON-serializable; helper methods are authoring-time only.
      Object.defineProperty(field, 'default', { enumerable: false });

      return field;
    },
  };
}

export function defineWebKitConfig<
  const Public extends WebKitEnvironmentFields,
  const Private extends WebKitEnvironmentFields,
>(input: WebKitConfigDefinition<Public, Private>): WebKitConfigDefinition<Public, Private> {
  return input;
}

export function resolveWebKitConfig<const Definition extends WebKitConfigDefinition>(
  definition: Definition,
  environment: WebKitEnvironmentValues,
): InferWebKitConfig<Definition> {
  // The recursive projection preserves each definition key at runtime; TS cannot express that recursion.
  return {
    public: resolveFields(definition.public, environment),
    private: resolveFields(definition.private, environment),
  } as InferWebKitConfig<Definition>;
}

/** Project only the public branch without resolving or serializing private values. */
export function resolveWebKitPublicConfig<const Definition extends WebKitConfigDefinition>(
  definition: Definition,
  environment: WebKitEnvironmentValues,
): InferWebKitPublicConfig<Definition> {
  return resolveFields(definition.public, environment) as InferWebKitPublicConfig<Definition>;
}

export function isWebKitEnvironmentVariable(
  field: WebKitEnvironmentVariable | WebKitEnvironmentFields,
): field is WebKitEnvironmentVariable {
  return 'source' in field && field.source === 'env' && 'name' in field && typeof field.name === 'string';
}

function resolveFields(fields: WebKitEnvironmentFields, environment: WebKitEnvironmentValues): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).map(([key, field]) => {
      if (isWebKitEnvironmentVariable(field)) {
        return [key, environment[field.name] ?? field.fallback];
      }

      return [key, resolveFields(field, environment)];
    }),
  );
}
