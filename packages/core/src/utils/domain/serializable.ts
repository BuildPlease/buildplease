/**
 * Interface for objects that can be converted to a JSON-compatible representation.
 *
 * This interface defines a `toJSON` method, allowing classes that implement it
 * to provide a custom JSON serialization format.
 */
export interface JSONSerializable {
  /**
   * Converts the object to a JSON-compatible format.
   *
   * @returns A JSON-compatible representation of the object.
   */
  toJSON(): any;
}
