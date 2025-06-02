/**
 * A type that represents a value that can be null or undefined.
 *
 * @template T
 */
export type OptionalValue<T> = T | null | undefined;

/**
 * Wraps a value to provide optional-aware operations.
 *
 * @template T
 */
export class Optional<T> {
  private readonly value: T | null | undefined;

  constructor(value: T | null | undefined) {
    this.value = value;
  }

  /**
   * Checks if the value is `null` or `undefined`.
   *
   * @returns {boolean}
   *   True if the contained value is `null` or `undefined`.
   */
  get isNil(): boolean {
    return this.value == null;
  }

  /**
   * Applies a transformation if the value is present.
   *
   * @param {(value: T) => U} transform
   *   A function to apply to the contained value.
   * @template U
   * @returns {Optional<U>}
   *   A new Optional wrapping the transformed value, or `Optional<null>` if absent.
   */
  map<U>(transform: (value: T) => U): Optional<U> {
    if (this.isNil) return new Optional<U>(null);
    return new Optional(transform(this.value as T));
  }

  /**
   * Applies a transformation and expects an Optional as the result.
   * Useful for chaining nested Optionals.
   *
   * @param {(value: T) => Optional<U>} transform
   *   A function returning an Optional.
   * @template U
   * @returns {Optional<U>}
   *   The result of the transformation, or `Optional<null>` if absent.
   */
  flatMap<U>(transform: (value: T) => Optional<U>): Optional<U> {
    if (this.isNil) return new Optional<U>(null);
    return transform(this.value as T);
  }

  /**
   * Returns the contained value if not null or undefined, or the result of the provided closure otherwise.
   *
   * @param {() => T} closure
   *   A function that returns a default value.
   * @returns {T}
   *   The contained value if present, or the result of `closure()`.
   */
  or(closure: () => T): T {
    return this.isNil ? closure() : (this.value as T);
  }

  /**
   * Returns the contained value if not null or undefined, otherwise throws the specified error.
   * If no error is provided, throws a default `Error('Conversion Error')`.
   *
   * @param {Error} [error]
   *   Optional error to throw if the value is absent.
   * @returns {T}
   *   The contained value if present.
   * @throws {Error}
   *   The provided error, or `Error('Conversion Error')` if none provided.
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
   *
   * @param {U} defaultValue
   *   A default value to return if the contained value is absent.
   * @template U
   * @returns {T | U}
   *   The contained value if present, or `defaultValue` otherwise.
   */
  orDefault<U>(defaultValue: U): T | U {
    return this.isNil ? defaultValue : (this.value as T);
  }

  /**
   * If the value is present, applies the provided function to it.
   *
   * @param {(value: T) => void} closure
   *   A function to execute if the value is present.
   * @returns {this}
   *   The current Optional instance for chaining.
   */
  ifPresent(closure: (value: T) => void): this {
    if (!this.isNil) {
      closure(this.value as T);
    }
    return this;
  }

  /**
   * If the value is absent (`null` or `undefined`), executes the provided function.
   *
   * @param {() => void} closure
   *   A function to execute if the value is absent.
   * @returns {this}
   *   The current Optional instance for chaining.
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
 *
 * @param {T | null | undefined} value
 *   The value to wrap.
 * @template T
 * @returns {Optional<T>}
 *   An instance of `Optional` containing the given value.
 */
export function optional<T>(value: T | null | undefined): Optional<T> {
  return new Optional(value);
}

/**
 * Executes a function and wraps the result in an Optional.
 * If the function throws, returns an Optional with `null` value.
 *
 * @param {() => T} fn
 *   The function to execute.
 * @template T
 * @returns {Optional<T>}
 *   An Optional wrapping the function result, or `Optional<null>` if an error occurs.
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
 *
 * @param {() => any | Promise<any>} fn
 *   A function that can return a value or a Promise.
 * @param {(error: any) => void} [onError]
 *   Optional function that handles the error.
 * @returns {Promise<void>}
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
 * Executes an async function and wraps the result in an Optional.
 * If the function throws, returns an Optional with `null` value.
 *
 * @param {() => Promise<T>} fn
 *   The async function to execute.
 * @param {(error: unknown) => void} [onError]
 *   Optional error handler.
 * @template T
 * @returns {Promise<Optional<T>>}
 *   An Optional wrapping the result, or `Optional<null>` if an error occurred.
 */
export async function ignoreErrorOptionalAsync<T>(
  fn: () => Promise<T>,
  onError?: (error: unknown) => void,
): Promise<Optional<T>> {
  try {
    const result = await fn();
    return new Optional(result);
  } catch (error) {
    if (onError) onError(error);
    return new Optional<T>(null);
  }
}

/**
 * Checks if a value is defined (not `undefined`).
 *
 * @param {OptionalValue<T>} value
 *   The value to check.
 * @template T
 * @returns {boolean}
 *   True if the value is not `undefined`.
 */
export function isDefined<T>(value: OptionalValue<T>): value is T {
  return value !== undefined;
}

/**
 * Checks if a value is not `null`.
 *
 * @param {OptionalValue<T>} value
 *   The value to check.
 * @template T
 * @returns {boolean}
 *   True if the value is not `null`.
 */
export function isNotNull<T>(value: OptionalValue<T>): value is T {
  return value !== null;
}

/**
 * Checks if a value is defined (not `undefined`) and not `null`.
 *
 * @param {OptionalValue<T>} value
 *   The value to check.
 * @template T
 * @returns {boolean}
 *   True if the value is neither `undefined` nor `null`.
 */
export function isDefinedAndNotNull<T>(value: OptionalValue<T>): value is T {
  return isDefined(value) && isNotNull(value);
}
