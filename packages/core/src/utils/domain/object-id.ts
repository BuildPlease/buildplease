/**
 * Interface for a wrapper around an ObjectId, providing both a string representation
 * and the original ObjectId value type.
 *
 * @template T - The type of the ObjectId value(e.g Mongoose.Types.ObjectId)
 */
export interface ObjectId<T> {
  /**
   * The ObjectId as a string representation.
   * Useful for scenarios where a string format is required.
   */
  readonly asString: string;

  /**
   * The original ObjectId value in its native type.
   * Can be used for operations requiring the original ObjectId type.
   */
  readonly value: T;
}
