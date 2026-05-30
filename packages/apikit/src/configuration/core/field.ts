// MARK: - Symbols

const CONFIGURATION_FIELD = Symbol('apikit.configuration.field');

// MARK: - Public

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

// MARK: - Internal

export function isConfigurationField(input: unknown): input is ConfigurationField<unknown, boolean, unknown> {
  return Boolean(
    input &&
    typeof input === 'object' &&
    (input as { readonly [CONFIGURATION_FIELD]?: unknown })[CONFIGURATION_FIELD] === true,
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
