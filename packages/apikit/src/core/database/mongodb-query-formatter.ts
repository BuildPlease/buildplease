import { injectable } from 'inversify';

import type { MongoDbQuery } from '#/database';

/**
 * Accepts a potentially nested MongoDbQuery<T> and returns a
 * flat object suitable for Mongoose’s `.find(...)` or similar methods.
 *
 * - Automatically skips any `undefined` values.
 * - Automatically skips any empty plain objects (`{}`).
 * - Preserves MongoDB operators (keys starting with `$`).
 * - Flattens nested fields into dot‐notation (e.g., `{ a: { b: 5 } }` → `{ "a.b": 5 }`).
 */
export interface MongoDbQueryFormatter {
  format<T>(query: MongoDbQuery<T>): Record<string, any>;
}

@injectable()
export class MongoDbQueryControllerImpl implements MongoDbQueryFormatter {
  /**
   * Entry point: flattens the provided query object into a single‐level map.
   *
   * @template T - The domain/entity type being queried.
   * @param {MongoDbQuery<T>} query - Possibly nested query filters.
   * @returns {Record<string, any>} - A flat filter with no `undefined` or empty‐object keys.
   */
  format<T>(query: MongoDbQuery<T>): Record<string, any> {
    // We treat the input as a plain object; any `undefined` keys will be dropped in flattenRecursive.
    return this.flattenRecursive(query as Record<string, any>, '');
  }

  /**
   * Recursively traverses `input` to build a flat filter map.
   *
   * - If a value is `undefined`, it is skipped.
   * - If a value is an empty plain object (`{}`), it is skipped.
   * - If a key starts with `$`, it is treated as an operator and not further flattened.
   * - Otherwise, nested objects without operators are expanded into dot‐notation keys.
   *
   * @param {Record<string, any>} input - The current subtree to flatten.
   * @param {string} path - Dot‐notation prefix (empty for top‐level).
   * @returns {Record<string, any>} - The accumulated flat filter for this branch.
   */
  private flattenRecursive(input: Record<string, any>, path: string): Record<string, any> {
    const result: Record<string, any> = {};

    for (const key of Object.keys(input)) {
      const value = input[key];

      // 1) Skip `undefined`
      if (value === undefined) {
        continue;
      }

      // 2) If this is an empty plain object, skip:
      if (this.isPlainObject(value) && Object.keys(value).length === 0) {
        continue;
      }

      // 3) If key is a MongoDB operator (e.g. "$and", "$or", "$expr"), preserve it:
      if (this.isOperator(key)) {
        result[key] = this.processOperator(key, value);
        continue;
      }

      // 4) Build the full dot‐notation path: "parent.child"
      const fullKey = path ? `${path}.${key}` : key;

      // 5) If value is a plain object without any operator children, flatten recursively:
      if (this.isPlainObject(value)) {
        // 5a) If it contains any operator (e.g. {$gt:5}), treat as a comparison clause:
        if (this.containsOperator(value)) {
          result[fullKey] = { ...value };
        } else {
          // 5b) No operators, descend deeper
          Object.assign(result, this.flattenRecursive(value, fullKey));
        }
      } else {
        // 6) Value is primitive, array, or RegExp: emit directly
        result[fullKey] = value;
      }
    }

    return result;
  }

  /**
   * Checks if `key` starts with `$`.
   * MongoDB operators always begin with `$`.
   *
   * @param {string} key
   * @returns {boolean}
   */
  private isOperator(key: string): boolean {
    return key.startsWith('$');
  }

  /**
   * Determines whether `obj` has any keys that start with `$`.
   * Used to detect nested comparison clauses.
   *
   * @param {Record<string, any>} obj
   * @returns {boolean}
   */
  private containsOperator(obj: Record<string, any>): boolean {
    return Object.keys(obj).some((k) => this.isOperator(k));
  }

  /**
   * Checks if `val` is a plain object (i.e., `{ ... }`).
   * Arrays, Date objects, and other non‐plain‐object values return `false`.
   *
   * @param {unknown} val
   * @returns {val is Record<string, any>}
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
   * - For $expr, return as-is (aggregation expression).
   * - If the operator’s value is an array (e.g. `$or: [ {...}, {...} ]`),
   *   flatten each element of that array recursively.
   * - If the operator’s value is a nested object (e.g. `$gt: 5` or `$in: { nested: 3 }`),
   *   flatten that object with no prefix.
   * - Otherwise, return the primitive/RegExp as-is.
   *
   * @param {string} key - The operator name (e.g. "$or", "$gt").
   * @param {any} value - The operator’s value.
   * @returns {any}
   */
  private processOperator(key: string, value: any): any {
    if (key === '$expr') {
      // `$expr` expects an aggregation expression tree—keep it untouched
      return value;
    }

    if (Array.isArray(value)) {
      // e.g. { $or: [ { a: 1 }, { b: 2 } ] }
      return value.map((item) => this.flattenRecursive(item, ''));
    }

    if (this.isPlainObject(value)) {
      // e.g. { $gt: 5 } or { $in: { nested: 3 } }
      return this.flattenRecursive(value, '');
    }

    // Primitive, RegExp, boolean, etc.
    return value;
  }
}
