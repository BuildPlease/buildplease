import type { JSONSerializable } from '@neutral/utils';

function invalid(details: unknown): Error {
  return new Error(`Invalid ObjectId value: ${String(details)}`);
}

/**
 * Immutable identifier value object.
 *
 * Stores a non-empty string and provides value-based equality, ordering,
 * hashing, and JSON serialization.
 */
export class ObjectId implements JSONSerializable {
  /**
   * Canonical identifier value.
   */
  public readonly value: string;

  /**
   * Creates a new {@link ObjectId}.
   *
   * @param input Raw identifier value.
   * @throws {Error} If `input` is `null`, `undefined`, or an empty/whitespace-only string.
   *
   * @example
   * ```ts
   * const id = new ObjectId("507f1f77bcf86cd799439011");
   * ```
   */
  constructor(input: string | null | undefined) {
    if (input == null) throw invalid(input);

    const trimmed = input.trim();
    if (trimmed.length === 0) throw invalid(input);

    this.value = trimmed;
    Object.freeze(this);
  }

  /**
   * Shorthand alias for {@link ObjectId.value}.
   *
   * Value as string semantic clarity.
   *
   * @returns Raw id string.
   *
   * @example
   * ```ts
   * const id = new ObjectId("abc");
   * id.asString; // "abc"
   * ```
   */
  public get asString(): string {
    return this.value;
  }

  /**
   * Checks value equality.
   *
   * @param other Another id or raw string.
   * @returns `true` if both values match.
   *
   * @example
   * ```ts
   * id.equals("abc");
   * id.equals(new ObjectId("abc"));
   * ```
   */
  public equals(other: ObjectId | string): boolean {
    return this.value === ObjectId.from(other).value;
  }

  /**
   * Compares two ids lexicographically.
   *
   * @param other Another id or raw string.
   * @returns -1 if less, 0 if equal, 1 if greater.
   *
   * @example
   * ```ts
   * ids.sort((a, b) => a.compare(b));
   * ```
   */
  public compare(other: ObjectId | string): -1 | 0 | 1 {
    const right = ObjectId.from(other).value;
    if (this.value === right) return 0;
    return this.value < right ? -1 : 1;
  }

  /**
   * Returns a stable hash key for Maps/Sets.
   *
   * @returns String hash key.
   *
   * @example
   * ```ts
   * const map = new Map<string, number>();
   * map.set(id.hash(), 1);
   * ```
   */
  public hash(): string {
    return this.value;
  }

  /**
   * Serializes to JSON as the raw identifier string.
   *
   * @returns Raw id value.
   */
  public toJSON(): string {
    return this.value;
  }

  /**
   * Converts to string.
   *
   * @returns Raw id value.
   */
  public toString(): string {
    return this.value;
  }

  /**
   * Coerces to a primitive string (e.g., template literals).
   *
   * @returns Raw id value.
   *
   * @example
   * ```ts
   * `${id}`;
   * ```
   */
  public [Symbol.toPrimitive](): string {
    return this.value;
  }

  /**
   * Normalizes an id-like value into an {@link ObjectId}.
   *
   * @param value Raw string or {@link ObjectId}.
   * @returns Normalized {@link ObjectId} instance.
   *
   * @example
   * ```ts
   * const id = ObjectId.from("abc");
   * ```
   */
  public static from(value: ObjectId | string): ObjectId {
    return value instanceof ObjectId ? value : new ObjectId(value);
  }

  /**
   * Checks if a value can be used to construct an {@link ObjectId}.
   *
   * @param value Value to check.
   * @returns `true` if it is a non-empty string.
   */
  public static isValid(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }

  /**
   * Creates a value-based set of unique id strings.
   *
   * Useful when you need deduplication independent of object identity.
   *
   * @param values Iterable of id-like values.
   * @returns Set of unique raw id strings.
   *
   * @example
   * ```ts
   * const unique = ObjectId.toValueSet([new ObjectId("a"), "a", "b"]);
   * unique.has("a"); // true
   * unique.size; // 2
   * ```
   */
  public static toValueSet(values: Iterable<ObjectId | string>): Set<string> {
    const set = new Set<string>();
    for (const value of values) set.add(ObjectId.from(value).value);
    return set;
  }
}
