import { injectable } from 'inversify';

import type { MongoDbQuery } from '#/database';

/**
 * Flattens a potentially nested MongoDbQuery<T> into a single-level filter object.
 *
 * - Skips any `undefined` values.
 * - Skips any empty plain objects (`{}`).
 * - Preserves MongoDB operators (keys starting with `$`).
 * - Flattens nested fields into dot-notation (e.g. `{ a: { b: 5 } }` → `{ "a.b": 5 }`).
 */
export interface MongoDbQueryFormatter {
  /**
   * @template T
   * @param query
   *   Possibly nested query filters.
   * @returns
   *   A flat filter with no `undefined` or empty-object keys.
   */
  format<T>(query: MongoDbQuery<T>): Record<string, any>;
}

@injectable()
export class MongoDbQueryFormatterImpl implements MongoDbQueryFormatter {
  /**
   * Flattens the provided query object into a single-level map.
   *
   * @template T
   * @param query
   *   Possibly nested query filters.
   * @returns
   *   A flat filter with no `undefined` or empty-object keys.
   */
  format<T>(query: MongoDbQuery<T>): Record<string, any> {
    return this.flattenRecursive(query as Record<string, any>, '');
  }

  /**
   * Recursively traverses `input` to build a flat filter map.
   *
   * - Skips `undefined` values.
   * - Skips empty plain objects (`{}`).
   * - Preserves MongoDB operator keys (starting with `$`).
   * - Flattens nested objects (without operators) into dot-notation keys.
   *
   * @param input
   *   The current subtree to flatten.
   * @param path
   *   Dot-notation prefix (empty for top-level).
   * @returns
   *   The accumulated flat filter for this branch.
   */
  private flattenRecursive(input: Record<string, any>, path: string): Record<string, any> {
    const result: Record<string, any> = {};

    for (const key of Object.keys(input)) {
      const value = input[key];

      // 1) Skip `undefined`.
      if (value === undefined) {
        continue;
      }

      // 2) Skip empty plain object (`{}`).
      if (this.isPlainObject(value) && Object.keys(value).length === 0) {
        continue;
      }

      // 3) Preserve MongoDB operator clause.
      if (this.isOperator(key)) {
        result[key] = this.processOperator(key, value);
        continue;
      }

      // 4) Build full dot-notation path: "parent.child".
      const fullKey = path ? `${path}.${key}` : key;

      // 5) If value is a plain object, check for operator children.
      if (this.isPlainObject(value)) {
        if (this.containsOperator(value)) {
          // Treat as a comparison clause (e.g. `{ $gt: 5 }`).
          result[fullKey] = { ...value };
        } else {
          // Descend deeper.
          Object.assign(result, this.flattenRecursive(value, fullKey));
        }
      } else {
        // 6) Primitive, array, or RegExp: emit directly.
        result[fullKey] = value;
      }
    }

    return result;
  }

  /**
   * Checks if a key is a MongoDB operator (starts with `$`).
   *
   * @param key
   * @returns
   *   True if the key begins with `$`.
   */
  private isOperator(key: string): boolean {
    return key.startsWith('$');
  }

  /**
   * Determines whether `obj` has any keys that start with `$`.
   *
   * @param obj
   * @returns
   *   True if at least one key begins with `$`.
   */
  private containsOperator(obj: Record<string, any>): boolean {
    return Object.keys(obj).some((k) => this.isOperator(k));
  }

  /**
   * Checks if `val` is a plain object (i.e., `{ ... }`).
   * Returns false for arrays, Date objects, and other non-plain values.
   *
   * @param val
   * @returns
   *   True if `val` is a non-null object whose prototype is `Object.prototype`.
   */
  private isPlainObject(val: unknown): val is Record<string, any> {
    return (
      typeof val === 'object' &&
      val !== null &&
      !Array.isArray(val) &&
      Object.getPrototypeOf(val) === Object.prototype
    );
  }

  /**
   * Handles the contents of a MongoDB operator clause:
   *
   * - For `$expr`, return as-is (aggregation expression).
   * - If the operator’s value is an array (e.g. `$or: [ {...}, {...} ]`),
   *   flatten each element recursively.
   * - If the operator’s value is a nested object (e.g. `$gt: 5`), flatten that object.
   * - Otherwise, return the primitive/RegExp as-is.
   *
   * @param key
   *   The operator name (e.g. `"$or"`, `"$gt"`).
   * @param value
   *   The operator’s value.
   * @returns
   *   The processed operator value.
   */
  private processOperator(key: string, value: any): any {
    if (key === '$expr') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.flattenRecursive(item, ''));
    }

    if (this.isPlainObject(value)) {
      return this.flattenRecursive(value, '');
    }

    return value;
  }
}
