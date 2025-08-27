import { Types } from 'mongoose';

import type { JSONSerializable } from '@nidavellirx/meowv-core';

import { ApiErrorFactory } from '#/error';

function invalid(details: unknown) {
  const message = `Invalid ObjectId value: ${String(details)}`;
  return ApiErrorFactory.make('Validation.INVALID_FORMAT', { details: message });
}

/**
 * Immutable wrapper around a Mongoose {@link Types.ObjectId}.
 *
 * Provides value-based equality, comparison, hashing,
 * and JSON serialization as the canonical hex string.
 */
export class ObjectId implements JSONSerializable {
  private readonly _value: Types.ObjectId;

  /**
   * Creates a new `ObjectId` instance.
   *
   * @param id - A 24-character hex string or a Mongoose `Types.ObjectId`.
   * @throws ApiError If the value is null/undefined or invalid.
   *
   * @example
   * ```ts
   * new ObjectId('507f1f77bcf86cd799439011');
   * new ObjectId(new Types.ObjectId());
   * ```
   */
  constructor(id: Types.ObjectId | string | null | undefined) {
    if (id == null) throw invalid(id);

    if (typeof id === 'string') {
      if (!Types.ObjectId.isValid(id)) throw invalid(id);
      this._value = new Types.ObjectId(id);
    } else {
      const hex = id.toHexString?.();
      if (typeof hex !== 'string' || !Types.ObjectId.isValid(hex)) throw invalid(hex ?? id);
      this._value = id;
    }

    Object.freeze(this);
  }

  /**
   * Returns the canonical 24-character hex string.
   *
   * @returns Canonical hex string.
   */
  get asString(): string {
    return this._value.toHexString();
  }

  /**
   * Returns the underlying native Mongoose `Types.ObjectId`.
   *
   * @returns Native ObjectId instance.
   */
  get value(): Types.ObjectId {
    return this._value;
  }

  /**
   * Checks value equality.
   *
   * @param other - Hex string, `Types.ObjectId`, or `ObjectId`.
   * @returns `true` if both represent the same ObjectId.
   */
  equals(other: string | Types.ObjectId | ObjectId): boolean {
    const rhs = ObjectId.from(other);
    return this.asString === rhs.asString;
  }

  /**
   * Compares two ObjectIds lexicographically.
   *
   * @param other - Hex string, `Types.ObjectId`, or `ObjectId`.
   * @returns -1 if less, 0 if equal, 1 if greater.
   */
  compare(other: string | Types.ObjectId | ObjectId): -1 | 0 | 1 {
    const a = this.asString;
    const b = ObjectId.from(other).asString;
    if (a === b) return 0;
    return a < b ? -1 : 1;
  }

  /**
   * Returns a stable hash key for Maps/Sets.
   *
   * @returns Canonical hex string.
   */
  hash(): string {
    return this.asString;
  }

  /**
   * Converts to JSON as the canonical hex string.
   *
   * @returns Canonical hex string.
   */
  toJSON(): string {
    return this.asString;
  }

  /**
   * Converts to string as the canonical hex string.
   *
   * @returns Canonical hex string.
   */
  toString(): string {
    return this.asString;
  }

  /**
   * Coerces to a primitive string.
   *
   * @returns Canonical hex string.
   */
  [Symbol.toPrimitive](): string {
    return this.asString;
  }

  // ---------- statics ----------

  /**
   * Checks if a value is a valid ObjectId string.
   *
   * @param input - Value to check.
   * @returns `true` if valid string.
   */
  static isValid(input: unknown): input is string {
    return typeof input === 'string' && Types.ObjectId.isValid(input);
  }

  /**
   * Normalizes a value into an `ObjectId`.
   *
   * @param input - Hex string, `Types.ObjectId`, or `ObjectId`.
   * @returns Normalized ObjectId.
   */
  static from(input: string | Types.ObjectId | ObjectId): ObjectId {
    if (input instanceof ObjectId) return input;
    return new ObjectId(input);
  }

  /**
   * Compares two ID-like values for equality.
   *
   * @param a - First ID.
   * @param b - Second ID.
   * @returns `true` if equal.
   */
  static equals(a: string | Types.ObjectId | ObjectId, b: string | Types.ObjectId | ObjectId): boolean {
    return ObjectId.from(a).equals(b);
  }

  /**
   * Compares two ID-like values.
   *
   * @param a - First ID.
   * @param b - Second ID.
   * @returns -1 if less, 0 if equal, 1 if greater.
   */
  static compare(a: string | Types.ObjectId | ObjectId, b: string | Types.ObjectId | ObjectId): -1 | 0 | 1 {
    return ObjectId.from(a).compare(b);
  }

  /**
   * Creates a value-based `Set` of canonical strings.
   *
   * @param values - Iterable of ID-like values.
   * @returns Set of unique hex strings.
   *
   * @example
   * ```ts
   * const ids = ObjectId.toValueSet([idA, idB, '507f1f77bcf86cd799439011']);
   * ids.has(idA.asString); // true
   * ```
   */
  static toValueSet(values: Iterable<string | Types.ObjectId | ObjectId>): Set<string> {
    const s = new Set<string>();
    for (const v of values) s.add(ObjectId.from(v).asString);
    return s;
  }
}
