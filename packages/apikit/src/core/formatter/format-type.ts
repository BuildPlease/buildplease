import mime from 'mime-types';

import { ApiErrorFactory } from '#/error';

/**
 * Wraps both raw MIME strings (e.g. "image/png") and file extensions (e.g. "png", "foo.png")
 * into a validated media-type. Throws if the input cannot be resolved.
 *
 * @example
 * // Create from a filename extension
 * const fmt1 = new FormatType('foo.png');
 * console.log(fmt1.value);      // "image/png"
 * console.log(fmt1.extension);  // "png"
 *
 * @example
 * // Create directly from a MIME string
 * const fmt2 = new FormatType('application/json');
 * console.log(fmt2.value);      // "application/json"
 * console.log(fmt2.extension);  // "json"
 *
 * @example
 * // Compare two formats for equality
 * const a = new FormatType('png');
 * const b = new FormatType('image/png');
 * console.log(a.equals(b));     // true
 *
 * @example
 * // Catch error when extension lookup fails
 * try {
 *   const fmt = new FormatType('application/octet-stream');
 *   console.log(fmt.extension);
 * } catch {
 *   // ApiErrorFactory.make('Format.UNSUPPORTED_FORMAT') was thrown
 * }
 *
 * @example
 * // Validate a Content-Type header in an HTTP handler
 * function handleUpload(contentTypeHeader: string) {
 *   try {
 *     const fmt = new FormatType(contentTypeHeader);
 *     // downstream: use fmt.extension to decide where to store or how to process
 *   } catch {
 *     // rethrow a standardized error for unsupported formats
 *     throw ApiErrorFactory.make('Format.UNSUPPORTED_FORMAT');
 *   }
 * }
 */
export class FormatType {
  private readonly mimeType: string;

  /**
   * @param input
   *   Either a raw media-type ("type/subtype") or a filename/extension
   *   (e.g. "foo.png", ".png", "png").
   *
   * @throws
   *   ApiErrorFactory.make('Format.UNSUPPORTED_FORMAT') if the input cannot be resolved
   *   to a known MIME type.
   *
   * @example
   * // Valid extension
   * new FormatType('jpg'); // resolves to "image/jpeg"
   *
   * @example
   * // Valid MIME
   * new FormatType('text/plain'); // resolves to "text/plain"
   *
   * @example
   * // Invalid input throws
   * try {
   *   new FormatType('unknown.ext');
   * } catch (err) {
   *   // err is an ApiError with code "Format.UNSUPPORTED_FORMAT"
   * }
   */
  constructor(input: string) {
    // MARK: - “type/subtype”: validate that it’s known
    if (input.includes('/')) {
      if (!mime.extension(input)) {
        throw ApiErrorFactory.make('Format.UNSUPPORTED_FORMAT');
      }
      this.mimeType = input;
      return;
    }

    // MARK: - Otherwise, treat as filename or extension
    const lookup = mime.lookup(input);
    if (!lookup) {
      throw ApiErrorFactory.make('Format.UNSUPPORTED_FORMAT');
    }
    this.mimeType = lookup;
  }

  /**
   * The validated media-type string (e.g. "image/png").
   */
  get value(): string {
    return this.mimeType;
  }

  /**
   * The canonical file extension for this media type (e.g. "png" for "image/png").
   *
   * @throws
   *   ApiErrorFactory.make('Format.UNSUPPORTED_FORMAT') if no extension is found.
   *
   * @example
   * const fmt = new FormatType('image/gif');
   * console.log(fmt.extension); // "gif"
   */
  get extension(): string {
    const ext = mime.extension(this.mimeType);
    if (!ext) {
      throw ApiErrorFactory.make('Format.UNSUPPORTED_FORMAT');
    }
    return ext;
  }

  /**
   * Compares this FormatType with another by their media-type strings.
   *
   * @param other
   *   Another FormatType to compare against.
   *
   * @returns
   *   True if both instances resolve to the same media-type; false otherwise.
   *
   * @example
   * const f1 = new FormatType('jpg');
   * const f2 = new FormatType('image/jpeg');
   * console.log(f1.equals(f2)); // true
   *
   * @example
   * const f3 = new FormatType('text/html');
   * console.log(f2.equals(f3)); // false
   */
  equals(other: FormatType): boolean {
    return this.mimeType === other.value;
  }
}
