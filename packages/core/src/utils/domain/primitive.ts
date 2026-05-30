export type Primitive = string | number | boolean | bigint | symbol | null | undefined;

/**
 * Checks if a value is a JavaScript primitive.
 *
 * @param value - The value to check.
 * @returns True if the value is a primitive.
 */
export function isPrimitive(value: unknown): value is Primitive {
  return (
    value === null || value === undefined || ['string', 'number', 'boolean', 'bigint', 'symbol'].includes(typeof value)
  );
}
