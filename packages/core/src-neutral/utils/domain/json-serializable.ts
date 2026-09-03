/**
 * JSON primitive.
 *
 * @remarks Valid JSON primitive types are: string, number, boolean, null.
 */
export type JSONPrimitive = string | number | boolean | null;

/**
 * JSON object (string keys, JSON values).
 *
 * @remarks Keys must be strings. Values must be valid {@link JSONValue}.
 */
export type JSONObject = { [key: string]: JSONValue };

/**
 * Any JSON value.
 *
 * @remarks Safe to pass to `JSON.stringify` and read back with `JSON.parse`.
 */
export type JSONValue = JSONPrimitive | JSONObject | ReadonlyArray<JSONValue>;

/**
 * Implemented by types that can serialize themselves to JSON.
 */
export interface JSONSerializable {
  /**
   * Convert this instance to a JSON value.
   *
   * @returns A {@link JSONValue} suitable for `JSON.stringify`.
   */
  toJSON(): JSONValue;
}

/**
 * Checks whether a value is a JSON primitive.
 *
 * @param value - Input value to test.
 * @returns `true` if `value` is a JSON primitive (`string | number | boolean | null`), otherwise `false`.
 */
export function isJSONPrimitive(value: unknown): value is JSONPrimitive {
  return value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

/**
 * Checks whether a value implements {@link JSONSerializable}.
 *
 * @param value - Input value to test.
 * @returns `true` if `value` is a non-null object with a `toJSON()` function, otherwise `false`.
 */
export function isJSONSerializable(value: unknown): value is JSONSerializable {
  return typeof value === 'object' && value !== null && typeof (value as any).toJSON === 'function';
}
