/**
 * A type that represents a value that can be null or undefined.
 *
 * @template T
 * @type Nullable
 */
export type OptionalValue<T> = T | null | undefined;

/**
 * Class that wraps a value to provide optional-aware operations.
 */
export class Optional<T> {
  constructor(private value: T | null | undefined) {}

  /**
   * Checks if the value is `null` or `undefined`.
   */
  get isNil(): boolean {
    return this.value == null;
  }

  /**
   * Applies a transformation if the value is present.
   * @param transform - A function to apply to the contained value.
   * @returns A new Optional with the transformed value.
   */
  map<U>(transform: (value: T) => U): Optional<U> {
    if (this.isNil) return new Optional<U>(null);
    return new Optional(transform(this.value as T));
  }

  /**
   * Applies a transformation and expects an Optional as the result.
   * Useful for chaining.
   * @param transform - A function returning an Optional.
   * @returns The result of the transformation.
   */
  flatMap<U>(transform: (value: T) => Optional<U>): Optional<U> {
    if (this.isNil) return new Optional<U>(null);
    return transform(this.value as T);
  }

  /**
   * Returns the contained value if not null or undefined, or the result of the provided closure otherwise.
   * @param closure - A function that returns a default value.
   */
  or(closure: () => T): T {
    return this.isNil ? closure() : (this.value as T);
  }

  /**
   * Returns the contained value if not null or undefined, otherwise throws the specified error.
   * If no error is provided, throws a default `ConversionError` with file and line details.
   * @param error - Optional error to throw if the value is `null` or `undefined`.
   * @throws The provided error, or a default `ConversionError`.
   */
  orThrow(error?: Error): T {
    if (this.isNil) {
      throw error || new Error('Conversion Error');
    }
    return this.value as T;
  }

  /**
   * Returns the contained value if not null or undefined, or the provided default value otherwise.
   * Allows `null` as a default only if `T | null` is assignable to the expected type.
   * @param defaultValue - A default value to return if the contained value is null or undefined.
   */
  orDefault<U>(defaultValue: U): T | U {
    return this.isNil ? defaultValue : (this.value as T);
  }

  /**
   * If the value is present, applies the provided function to it.
   * @param closure - A function to execute if the value is present.
   * @returns The current Optional instance for chaining.
   */
  ifPresent(closure: (value: T) => void): this {
    if (!this.isNil) {
      closure(this.value as T);
    }
    return this;
  }

  /**
   * If the value is absent (null or undefined), executes the provided function.
   * @param closure - A function to execute if the value is absent.
   * @returns The current Optional instance for chaining.
   */
  ifAbsent(closure: () => void): this {
    if (this.isNil) {
      closure();
    }
    return this;
  }
}

/**
 * Wraps a value in an `Optional` instance.
 * @param value - The value to wrap.
 * @returns An instance of `Optional`.
 */
export function optional<T>(value: T | null | undefined): Optional<T> {
  return new Optional(value);
}

/**
 * Executes a function and wraps the result in an Optional.
 * If the function throws, returns an Optional with `null` value.
 *
 * @param fn - The function to execute.
 * @returns An Optional wrapping the function result, or `null` if an error occurs.
 */
export function ignoreError<T>(fn: () => T): Optional<T> {
  try {
    return new Optional(fn());
  } catch {
    return new Optional<T>(null);
  }
}

/**
 * Executes the provided function and suppresses any errors.
 * Supports both synchronous and asynchronous functions.
 * Optionally executes a provided error handler function if an error occurs.
 * @param fn A function that can return a value or a Promise.
 * @param onError An optional function that handles the error.
 */
export async function ignoreErrorAsync(
  fn: () => any | Promise<any>,
  onError?: (error: any) => void,
): Promise<void> {
  try {
    await fn();
  } catch (error) {
    if (onError) {
      onError(error);
    }
  }
}

/**
 * Checks if a value is defined (not undefined).
 *
 * @template T
 * @param {OptionalValue<T>} value - The value to check.
 * @returns {boolean} - True if the value is not undefined.
 */
export function isDefined<T>(value: OptionalValue<T>): value is T {
  return value !== undefined;
}

/**
 * Checks if a value is not null.
 *
 * @template T
 * @param {OptionalValue<T>} value - The value to check.
 * @returns {boolean} - True if the value is not null.
 */
export function isNotNull<T>(value: OptionalValue<T>): value is T {
  return value !== null;
}

/**
 * Checks if a value is defined (not undefined) and not null.
 *
 * @template T
 * @param {OptionalValue<T>} value - The value to check.
 * @returns {boolean} - True if the value is not undefined and not null.
 */
export function isDefinedAndNotNull<T>(value: OptionalValue<T>): value is T {
  return isDefined(value) && isNotNull(value);
}
